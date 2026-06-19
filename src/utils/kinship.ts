import { ClanMember, Gender } from '../types';

export function calculateKinship(
  members: ClanMember[], 
  sourceId: string, 
  targetId: string
): string {
  if (sourceId === targetId) return 'Chính bạn';

  const memberMap = new Map<string, ClanMember>();
  members.forEach(m => memberMap.set(m.id, m));

  const source = memberMap.get(sourceId);
  const target = memberMap.get(targetId);

  if (!source || !target) return 'Chưa rõ';

  // Find path to root for a member
  const getPathToRoot = (memberId: string): string[] => {
    const path: string[] = [];
    const visited = new Set<string>();
    let currentId: string | null = memberId;
    while (currentId) {
      if (visited.has(currentId)) {
         break; // Prevent infinite loops from circular references like spouseId pointing to each other
      }
      visited.add(currentId);
      path.push(currentId);
      
      const m = memberMap.get(currentId);
      if (!m) break;
      
      // We only traverse UP the tree. 
      // If it's a spouse, we should go to their primary bloodline partner FIRST, then up to father/mother.
      // But we must NOT go back and forth between spouses.
      if (m.spouseId && memberMap.get(m.spouseId) && !visited.has(m.spouseId)) {
        currentId = m.spouseId;
      } else {
        currentId = m.fatherId || m.motherId || null;
      }
    }
    return path;
  };

  const sourcePath = getPathToRoot(sourceId);
  const targetPath = getPathToRoot(targetId);

  // Find lowest common ancestor (LCA)
  let lca: string | null = null;
  for (const id of sourcePath) {
    if (targetPath.includes(id)) {
      lca = id;
      break;
    }
  }

  if (!lca) {
    // Check if target is a spouse of someone in the path, or vice versa
    return 'Người trong họ (Chưa rõ nhánh)';
  }

  const sourceGenDiff = sourcePath.indexOf(lca);
  const targetGenDiff = targetPath.indexOf(lca);

  const isTargetSpouse = target.spouseId !== undefined && target.spouseId !== null;
  const targetPrimary = isTargetSpouse ? memberMap.get(target.spouseId!) : target;
  
  if (!targetPrimary) return 'Chưa rõ';

  const isMale = target.gender === Gender.MALE;

  // Direct descendant/ancestor
  if (sourceGenDiff === 0) { // Source is ancestor of target
    if (targetGenDiff === 1) return isMale ? 'Con trai' : 'Con gái';
    if (targetGenDiff === 2) return isMale ? 'Cháu trai' : 'Cháu gái';
    if (targetGenDiff === 3) return 'Chắt';
    if (targetGenDiff === 4) return 'Chút';
    return 'Chít / Cháu chắt';
  }

  if (targetGenDiff === 0) { // Target is ancestor of source
    if (sourceGenDiff === 1) return isMale ? 'Cha / Bố' : 'Mẹ / Má';
    if (sourceGenDiff === 2) return isMale ? 'Ông' : 'Bà';
    if (sourceGenDiff === 3) return isMale ? 'Cụ Ông / Cố' : 'Cụ Bà / Cố';
    if (sourceGenDiff === 4) return isMale ? 'Kỵ Ông' : 'Kỵ Bà';
    return 'Tổ tiên';
  }

  // Collateral relatives (Anh em, Bác cháu, Chú cháu)
  // Determine who is from the older branch
  let sourceBranchNodeId = sourcePath[sourceGenDiff - 1];
  let targetBranchNodeId = targetPath[targetGenDiff - 1];

  const sourceBranchNode = memberMap.get(sourceBranchNodeId);
  const targetBranchNode = memberMap.get(targetBranchNodeId);

  // If we can't find birth order, default to source being younger
  let targetIsOlderBranch = false;
  if (sourceBranchNode && targetBranchNode) {
    const sOrder = sourceBranchNode.birthOrder || 99;
    const tOrder = targetBranchNode.birthOrder || 99;
    targetIsOlderBranch = tOrder < sOrder;
  }

  // Same generation
  if (sourceGenDiff === targetGenDiff) {
    if (targetIsOlderBranch) {
      return isMale ? 'Anh họ' : 'Chị họ';
    } else {
      return isMale ? 'Em họ (Trai)' : 'Em họ (Gái)';
    }
  }

  // Target is older generation (e.g. Bác, Chú, Cô)
  if (sourceGenDiff > targetGenDiff) {
    const genDiff = sourceGenDiff - targetGenDiff;
    if (genDiff === 1) {
      if (targetIsOlderBranch) {
        return isMale ? 'Bác họ (Trai)' : 'Bác họ (Gái)';
      } else {
        return isMale ? 'Chú họ / Cậu họ' : 'Cô họ / Dì họ';
      }
    }
    if (genDiff === 2) {
      return isMale ? 'Ông trẻ / Ông họ' : 'Bà trẻ / Bà họ';
    }
    return isMale ? 'Cụ họ / Kỵ họ' : 'Cụ bà họ / Kỵ bà họ';
  }

  // Target is younger generation (e.g. Cháu họ)
  if (sourceGenDiff < targetGenDiff) {
    const genDiff = targetGenDiff - sourceGenDiff;
    if (genDiff === 1) return 'Cháu họ';
    if (genDiff === 2) return 'Chắt họ';
    return 'Chút/Chít họ';
  }

  return 'Người trong họ';
}
