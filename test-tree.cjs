const { stratify, tree } = require('d3-hierarchy');
const fs = require('fs');

const initialMembers = [
  { id: '1', fullName: 'Nguyễn Văn A', gender: 'male', generation: 1, isDeceased: true, branchId: 'CHI_TRUONG' },
  { id: '1W', fullName: 'Trần Thị B', gender: 'female', generation: 1, spouseId: '1', isDeceased: true },
  { id: '2', fullName: 'Nguyễn Văn C', gender: 'male', fatherId: '1', generation: 2, branchId: 'CHI_TRUONG' },
  { id: '3', fullName: 'Nguyễn Thị D', gender: 'female', fatherId: '1', generation: 2, branchId: 'CHI_TRUONG' },
  { id: '4', fullName: 'Nguyễn Văn E', gender: 'male', fatherId: '2', generation: 3, branchId: 'CHI_TRUONG' },
  { id: '2W', fullName: 'Lê Thị F', gender: 'female', spouseId: '2', generation: 2 },
  { id: '2W_2', fullName: 'Lê Thị G', gender: 'female', spouseId: '2', generation: 2 }, // multiple spouses
];

function run() {
    const members = initialMembers;
    const positions = {};
    const primaryMembersMap = new Map();
    const spouseToPrimaryMap = new Map();
    const processed = new Set();

    members.forEach(m => {
      if (processed.has(m.id)) return;
      
      const relatedSpouses = members.filter(other => other.spouseId === m.id || m.spouseId === other.id);
      if (relatedSpouses.length > 0) {
        const cluster = [m, ...relatedSpouses];
        let primary = cluster.find(c => c.fatherId) || cluster.find(c => c.gender === 'male') || cluster[0];
        
        primaryMembersMap.set(primary.id, primary);
        cluster.forEach(c => {
           if (c.id !== primary.id) {
              spouseToPrimaryMap.set(c.id, primary.id);
           }
           processed.add(c.id);
        });
      } else {
        primaryMembersMap.set(m.id, m);
        processed.add(m.id);
      }
    });

    const primaryMembers = Array.from(primaryMembersMap.values());
    
    const resolveParent = (parentId) => {
       if (!parentId) return null;
       if (spouseToPrimaryMap.has(parentId)) return spouseToPrimaryMap.get(parentId);
       if (primaryMembersMap.has(parentId)) return parentId;
       return null;
    };

    const rootIds = primaryMembers.filter(m => !resolveParent(m.fatherId || m.motherId)).map(m => m.id);

    const treeData = [
      { id: 'VIRTUAL_ROOT', parentId: null },
      ...primaryMembers.map(m => ({
          id: m.id,
          parentId: rootIds.includes(m.id) ? 'VIRTUAL_ROOT' : resolveParent(m.fatherId || m.motherId)
      }))
    ];

    console.log(treeData);
    try {
      const root = stratify()
        .id(d => d.id)
        .parentId(d => d.parentId)(treeData);
      console.log('stratify success');
    } catch (e) {
      console.error(e);
    }
}
run();
