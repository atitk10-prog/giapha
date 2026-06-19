import { stratify, tree } from 'd3-hierarchy';

const members = [
  { id: '1', fatherId: null, gender: 'nam', spouseId: '1w' },
  { id: '1w', fatherId: null, gender: 'nu', spouseId: '1' },
  { id: '2', fatherId: '1', gender: 'nam', spouseId: null },
  { id: '3', fatherId: '1', gender: 'nam', spouseId: null }
];

const bloodHeirs = members.filter(m => !m.id.endsWith('w'));
const rootIds = bloodHeirs.filter(m => !m.fatherId || !bloodHeirs.find(b => b.id === m.fatherId)).map(m => m.id);

const treeData = [
  { id: 'VIRTUAL_ROOT', parentId: null },
  ...bloodHeirs.map(m => ({
    id: m.id,
    parentId: rootIds.includes(m.id) ? 'VIRTUAL_ROOT' : m.fatherId
  }))
];

const root = stratify()
  .id(d => d.id)
  .parentId(d => d.parentId)(treeData);

const treeLayout = tree()
  .nodeSize([180, 180])
  .separation((a, b) => a.parent === b.parent ? 1.5 : 2);

treeLayout(root);

const positions = {};
root.each(node => {
  if (node.id === 'VIRTUAL_ROOT') return;
  positions[node.id] = { x: node.x, y: node.y };
});
console.log(positions);
