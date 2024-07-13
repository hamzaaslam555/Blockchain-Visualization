export const nodes = [
    { id: 'n-0', label: 'Sender 1' },
    { id: 'n-1', label: 'Recipient 1' },
    { id: 'n-2', label: 'Recipient 2' },
    { id: 'n-3', label: 'Recipient 3' },
    { id: 'n-4', label: 'Recipient 4' }
  ];
  
  export const edges = [
    {
      id: "0->1",
      source: "n-4",
      target: "n-1",
      label: "2.5 ETH",
    },
    {
      id: "0->2",
      source: "n-0",
      target: "n-2",
      label: "1.0 ETH"
    },
    {
      id: "0->3",
      source: "n-0",
      target: "n-3",
      label: "0.8 ETH"
    },
    {
      id: "0->4",
      source: "n-0",
      target: "n-4",
      label: "3.2 ETH"
    }
  ];
  