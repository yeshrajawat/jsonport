import { FixedSizeList as List } from "react-window";

export default function VirtualJsonTree({ nodes, onSelect }) {

  const Row = ({ index, style }) => {
    const node = nodes[index];

    return (
      <div
        style={{
          ...style,
          paddingLeft: node.level * 20,
          fontFamily: "monospace",
          cursor: "pointer"
        }}
        onClick={() => onSelect(node.path)}
      >
        {node.key}: {String(node.value)}
      </div>
    );
  };

  return (
    <List
      height={400}
      itemCount={nodes.length}
      itemSize={24}
      width="100%"
    >
      {Row}
    </List>
  );
}