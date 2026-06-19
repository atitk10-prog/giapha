const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace branch ref with state
content = content.replace(
  /const branchesRef = useRef<ClanBranch\[\]>\(\[\]\);/g, 
  'const [branches, setBranches] = useState<ClanBranch[]>([]);'
);

// Replace branch initialization
content = content.replace(
  /branchesRef\.current = data\.branches \|\| \[\];/g, 
  'setBranches(data.branches || []);'
);

// Add pushStateUpdate definition
const pushStateUpdateStr = `  const pushStateUpdate = async (newState: any) => {
    try {
      await fetch('/api/family-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newState)
      });
    } catch (e) {
      console.error("Failed to sync to server", e);
    }
  };

  // Generate logs helper
  const handleAddLog = (action: string, target: string) => {`;

content = content.replace(
  /  \/\/ Generate logs helper\n  const handleAddLog = \(action: string, target: string\) => \{/g,
  pushStateUpdateStr
);

// Replace all branchesRef.current with branches
content = content.replace(/branchesRef\.current/g, 'branches');

fs.writeFileSync('src/App.tsx', content);
