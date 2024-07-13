import React, { useEffect, useState } from "react";
import { GraphCanvas } from "reagraph";
import WalletCard from "./walletCard";
import "./App.css";

function transformData(walletData) {
  let edges = [];

  // Process transactions to create edges first
  walletData.txs.forEach((tx, index) => {
    if (tx.inputs) {
      tx.inputs.forEach((input) => {
        if (
          input.prev_out &&
          input.prev_out.addr &&
          input.prev_out.value &&
          input.prev_out.addr !== walletData.address
        ) {
          edges.push({
            source: input.prev_out.addr,
            target: walletData.address,
            label: `Tx ${index + 1}: ${input.prev_out.value} satoshis`,
          });
        }
      });
    }

    if (tx.out) {
      tx.out.forEach((output) => {
        if (output.addr && output.value && walletData.address !== output.addr) {
          edges.push({
            source: walletData.address,
            target: output.addr,
            label: `Tx ${index + 1}: ${output.value} satoshis`,
          });
        }
      });
    }
  });

  // Build a set of nodes from edges
  const nodeCountMap = new Map();
  edges.forEach((edge) => {
    nodeCountMap.set(edge.source, (nodeCountMap.get(edge.source) || 0) + 1);
    nodeCountMap.set(edge.target, (nodeCountMap.get(edge.target) || 0) + 1);
  });

  // Sort nodes by their connection count (degree) and limit to the first 60
  const sortedNodes = Array.from(nodeCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 60)
    .map((entry) => entry[0]);

  // Filter edges to include only those that have both nodes in the sortedNodes list
  edges = edges.filter(
    (edge) =>
      sortedNodes.includes(edge.source) && sortedNodes.includes(edge.target)
  );

  // Map the sorted node list to node objects
  const nodes = sortedNodes.map((node) => ({ id: node, label: node }));

  return { nodes, edges };
}

function App() {
  const [data, setData] = useState({ nodes: [], edges: [] });
  const [allData, setAllData] = useState({ nodes: [], edges: [] });
  const [tooltip, setTooltip] = useState("");
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [currentWallet, setCurrentWallet] = useState(null);
  const [showGraph, setShowGraph] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (currentWallet) {
      setLoading(true);
      setError("");
      console.log(`Current wallet file: ${currentWallet.walletFile}`); // This should log a string, not an object
      fetch(`/${currentWallet}`)
        .then((response) => {
          console.log("Response:", response);
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(
                "Failed to fetch, server responded with: " + text
              );
            });
          }
          return response.json();
        })
        .then((jsonData) => {
          console.log("jsonData", jsonData);
          const transformedData = transformData(jsonData);
          console.log("transformedData", transformedData);
          setAllData(transformedData);
          setData({
            nodes: [
              { id: "0", label: `Node 0: ${transformedData.nodes[0].label}` },
            ],
            edges: [
              { source: "0", target: "1" },
              // transformedData.edges[0],
              // , transformedData.edges[1]
            ],
          });
          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch data:", error);
          setError("Failed to load data");
          setLoading(false);
        });
    }
  }, [currentWallet]);

  const selectWallet = (walletFile) => {
    setCurrentWallet(walletFile);
    setShowGraph(true); // Show the graph when a wallet is selected
  };
  const handleBackButtonClick = () => {
    setShowGraph(false); // Hide the graph and show the wallet cards
  };

  // if (loading) return <div>Loading...</div>;
  // if (error) return <div>Error: {error}</div>;

  const handleNodePointerOver = (node, event) => {
    console.log("node", node);
    console.log("event", event);
    setTooltip(`${node.id}: ${node.label.substring(0, 5)}`);
    setTooltipPos({ x: event.clientX, y: event.clientY });
  };

  const handleEdgePointerOver = (edge, event) => {
    console.log("Event object:", event); // Check what the event object contains
    if (event && event.clientX && event.clientY) {
      setTooltip(
        `${edge.label.substring(0, 5)}: ${edge.source.substring(
          0,
          5
        )} to ${edge.target.substring(0, 5)}`
      );
      setTooltipPos({ x: event.clientX, y: event.clientY });
    } else {
      console.log("Event does not contain clientX and clientY properties");
    }
  };

  const handlePointerOut = () => {
    setTooltip("");
    setTooltipPos({ x: 0, y: 0 });
  };

  const handleNodeDoubleClick = (event) => {
    const currentNode = data.nodes.find((item) => item.id === event.id);
    if (currentNode.id === String(data.nodes.length - 1)) {
      const nextEdge = {
        label: "Tx 1: satoshis",
        source: String(data.nodes.length),
        target: String(data.nodes.length + 1),
      };
      // console.log("nextEdge", nextEdge);
      const nextNode = {
        id: String(data.nodes.length),
        label: `Node ${data.nodes.length}: ${
          allData.nodes[data.nodes.length]?.label
        }`,
      };
      // console.log("nextNode", nextNode);
      setData({
        nodes: [...data.nodes, nextNode],
        edges: [...data.edges, nextEdge],
      });
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {!showGraph && (
        <div
          className='wallet-cards-container'
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {["wallet1.json", "wallet2.json", "wallet3.json", "wallet4.json"].map(
            (walletFile) => (
              <WalletCard
                key={walletFile}
                walletFile={walletFile}
                onSelectWallet={selectWallet}
              />
            )
          )}
        </div>
      )}
      {currentWallet ? (
        showGraph && (
          <GraphCanvas
            layoutType='hierarchicalLr'
            labelType='auto'
            edgeArrowPosition='end'
            draggable={true}
            nodes={data.nodes}
            edges={data.edges}
            renderNode={({ size, color, opacity }) => (
              <group>
                <mesh>
                  <boxGeometry attach='geometry' args={[30, 30, 0]} />
                  <meshBasicMaterial
                    attach='material'
                    color={"blue"}
                    opacity={opacity}
                    transparent
                  />
                </mesh>
              </group>
            )}
            onNodePointerOver={handleNodePointerOver}
            onNodePointerOut={handlePointerOut}
            onEdgePointerOver={handleEdgePointerOver}
            onEdgePointerOut={handlePointerOut}
            onNodeClick={handleNodeDoubleClick}
            layoutOverrides={{
              nodeSeparation: 500,
            }}
          />
        )
      ) : (
        <div></div>
      )}
    </div>
  );
}
export default App;
