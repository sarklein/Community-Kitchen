import { useState } from 'react';
import './past-recipes.css';

const sample_recipes = [
  {
    id: 1,
    title: 'Spaghetti Carbonara',
    desc: 'Classic Roman pasta with eggs, pecorino, and guanciale.',
    tags: ['pasta', 'italian'],
    date: '2026-08-12',
  },
  {
    id: 2,
    title: 'Chicken Tikka Masala',
    desc: 'Marinated chicken in a spiced tomato cream sauce.',
    tags: ['curry', 'chicken'],
    date: '2026-08-05',
  },
  {
    id: 3,
    title: 'Vegetable Stir Fry',
    desc: 'Seasonal vegetables tossed in a tangy sesame sauce.',
    tags: ['vegan', 'stir-fry'],
    date: '2026-07-18',
  },
  {
    id: 4,
    title: 'Beef Tacos',
    desc: 'Crisp tacos with seasoned beef, salsa, and cilantro.',
    tags: ['mexican', 'beef'],
    date: '2026-06-21',
  },
  {
    id: 5,
    title: 'Chocolate Chip Cookies',
    desc: 'Chewy cookies loaded with dark chocolate chips.',
    tags: ['dessert', 'baking'],
    date: '2026-05-09',
  },
];

function PastRecipes() {
  const [query, setQuery] = useState('');

  const filtered = sample_recipes.filter((r) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      r.title.toLowerCase().includes(q) ||
      r.desc.toLowerCase().includes(q) ||
      r.tags.join(' ').toLowerCase().includes(q)
    );
  });

  return (
    <div className="past-recipes app-home">
      <header className="recipes-header">
        <div>
          <h1>Past Recipes</h1>
          <p className="lead">Browse recipes created and shared at our past community events.</p>
        </div>

        <div className="recipes-controls">
          <input
            aria-label="Search recipes"
            placeholder="Search by name, ingredient, or tag"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </header>

      <section className="recipes-grid">
        {filtered.map((r) => (
          <article className="recipe-card" key={r.id}>
            <div className="recipe-media">
              <img src={r.img} alt={`${r.title} photo`} />
            </div>
            <div className="recipe-body">
              <h3>{r.title}</h3>
              <p className="desc">{r.desc}</p>
              <div className="meta">
                <div className="tags">
                  {r.tags.map((t) => (
                    <span className="tag" key={t}>{t}</span>
                  ))}
                </div>
                <div className="date">{new Date(r.date).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="recipe-footer">
              <button className="view-btn">View Recipe</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default PastRecipes;
