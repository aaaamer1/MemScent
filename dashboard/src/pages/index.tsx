import RecipeCard from '../components/RecipeCard'

export default function Dashboard() {
  const mock = { name: 'Test Blend', components: [{ oil: 'Lavender', percent: 50 }] }
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">MemScent Dashboard</h1>
      <RecipeCard recipe={mock} />
    </div>
  )
}

