type Component = { oil: string; percent: number }

export default function RecipeCard({
  recipe,
}: {
  recipe: { name: string; components: Component[] }
}) {
  return (
    <div className="border rounded-lg p-4 my-4 shadow">
      <h2 className="text-xl font-semibold">{recipe.name}</h2>
      <ul className="mt-2">
        {recipe.components.map((c) => (
          <li key={c.oil}>
            {c.oil}: {c.percent}%
          </li>
        ))}
      </ul>
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Dispense
      </button>
    </div>
  )
}

