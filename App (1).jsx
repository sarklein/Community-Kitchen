import './App.css'
import { useState } from 'react'
import logo from './assets/Segoe UI.jpg'
import homepageImg from './assets/homepage.jpg'
import PastRecipes from './past-recipes.jsx'
import Host from './Host.jsx'
import Events from './Events.jsx'
import SignUpForm from './SignUpForm.jsx'
import MyEvents from './MyEvents.jsx'

function App() {
  const [page, setPage] = useState('home')

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand">
          <img src={logo} alt="Community Kitchen" />
        </div>
        <nav className="nav-links">
          <a href="#" onClick={(e) => { e.preventDefault(); setPage('home'); }}>Homepage</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage('signup'); }}>Sign up</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage('host'); }}>Host</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage('events'); }}>Events</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage('recipes'); }}>Past recipes</a>
        </nav>
      </header>

      {page === 'home' && (
        <main className="app-home" id="home">
          <section className="featured-section">
            <div className="featured-info">
              <h1>Building a community kitchen</h1>
              <p className="description">
                For people of all ages to sign up for a dinner night, contribute ingredients, and
                prepare a meal. It’s a space where neighbors meet, swap ideas, and
                grow their cooking skills side by side.
              </p>
            </div>
            <div className="featured-image">
              <img src={homepageImg} alt="Community kitchen" />
            </div>
          </section>

          <section className="mission">
            <h2>Cook together, learn together</h2>
            <p>
              Community Kitchen brings people together around simple ingredients and
              shared meals. Everyone can join, add what they can bring, and discover
              new recipes while making friends in the neighborhood.
            </p>
            <div className="cta-actions">
              <button type="button" onClick={() => setPage('signup')}>Sign up</button>
              <button type="button" onClick={() => setPage('host')}>Host an event</button>
              <button type="button" onClick={() => setPage('events')}>Find future events</button>
              <button type="button" onClick={() => setPage('myevents')}>My Events</button>
            </div>
          </section>
        </main>
      )}

      {page === 'signup' && (
        <main className="app-home">
          <SignUpForm />
        </main>
      )}

      {page === 'host' && (
        <main className="app-home">
          <Host />
        </main>
      )}

      {page === 'events' && (
        <main className="app-home">
          <Events />
        </main>
      )}

      {page === 'myevents' && (
        <main className="app-home">
          <MyEvents />
        </main>
      )}

      {page === 'recipes' && (
        <main className="app-home">
          <PastRecipes />
        </main>
      )}
    </div>
  )
}

export default App
