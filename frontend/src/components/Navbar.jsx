import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-wider">
          HireSphere
        </Link>
        <div className="space-x-4">
          <Link to="/" className="hover:text-blue-200 transition">Home</Link>
          <Link to="/jobs" className="hover:text-blue-200 transition">Browse Jobs</Link>
          <Link to="/login" className="bg-white text-blue-600 px-4 py-2 rounded-md font-semibold hover:bg-gray-100 transition">
            Login
          </Link>
        </div>
      </div>
    </nav>
  )
}