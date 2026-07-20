import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getAllBlogs, deleteBlog } from "../../services/blogService";
 
const API_URL = import.meta.env.VITE_BACKEND_URL;
 
const BlogTable = () => {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
 
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await getAllBlogs(token, search);
      setBlogs(data.blogs || []);
    } catch (error) {
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchBlogs();
  }, [search]);
 
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await deleteBlog(id, token);
      toast.success("Blog deleted successfully");
      fetchBlogs();
    } catch {
      toast.error("Failed to delete blog");
    }
  };
 
  return (
    <div className="max-w-6xl mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10 mt-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold">Manage Blogs</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={() => navigate("/blog/add")}
            className="bg-primary-400 text-white py-2 px-4 rounded-md hover:bg-primary-600 transition duration-300 whitespace-nowrap"
          >
            + Add Blog
          </button>
        </div>
      </div>
 
      {loading ? (
        <p className="text-center py-10 text-gray-500">Loading...</p>
      ) : blogs.length === 0 ? (
        <p className="text-center py-10 text-gray-500">No blogs found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-accent-200 rounded-lg overflow-hidden">
            <thead className="bg-primary-100 text-gray-700">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Thumbnail</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog, i) => (
                <tr key={blog._id} className="border-t border-accent-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3">
                    {blog.thumbnail ? (
                      <img
                        src={`${API_URL}/uploads/blogs/${blog.thumbnail}`}
                        alt={blog.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                        No img
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-medium line-clamp-2" dangerouslySetInnerHTML={{ __html: blog.title }} />
                    <p className="text-gray-400 text-xs mt-1">{blog.slug?.replace(/<[^>]*>/g, "")}</p>
                  </td>
                  <td className="px-4 py-3">{blog.author}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {blog.tags?.slice(0, 2).map((tag, j) => (
                        <span key={j} className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${blog.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/blog/edit/${blog._id}`, { state: { blog } })}
                        className="bg-info-500 text-white px-3 py-1 rounded hover:bg-info-600 text-xs transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="bg-[#ef4444] text-white px-3 py-1 rounded hover:bg-[#dc2626] text-xs transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
 
export default BlogTable;