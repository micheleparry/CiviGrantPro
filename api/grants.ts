// Mock grants data
const mockGrants = [
  {
    id: 1,
    title: "BLM Wildlife Conservation Grant",
    description: "Supporting wildlife conservation efforts in public lands",
    amount: 50000,
    deadline: "2024-06-15",
    status: "active",
    organization: "Bureau of Land Management",
    category: "Environmental"
  },
  {
    id: 2,
    title: "EPA Environmental Justice Grant",
    description: "Addressing environmental justice in underserved communities",
    amount: 75000,
    deadline: "2024-07-20",
    status: "active",
    organization: "Environmental Protection Agency",
    category: "Environmental"
  },
  {
    id: 3,
    title: "HHS Community Health Grant",
    description: "Improving community health outcomes",
    amount: 100000,
    deadline: "2024-08-10",
    status: "active",
    organization: "Department of Health and Human Services",
    category: "Healthcare"
  }
];

export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    res.json(mockGrants);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 