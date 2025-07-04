
import MosqueRegistrationForm from "@/components/mosque/MosqueRegistrationForm";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";

const RegisterMosque = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        setError("");
        const res = await apiRequest("GET", "/api/me");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError("You must be logged in as a verified mosque admin to register a mosque.");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const canRegister =
    user && user.role === "committee" && user.isVerified === true;

  return (
    <section className="py-12 bg-neutral-light pattern-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl font-bold mb-4">Register Your Mosque</h2>
          <p className="text-lg max-w-2xl mx-auto">
            Help worshippers find your mosque and access accurate prayer times by registering on MosqueTime.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md max-w-3xl mx-auto p-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-600 font-semibold py-8">{error}</div>
          ) : !canRegister ? (
            <div className="text-center text-yellow-700 font-semibold py-8">
              Only verified mosque admins can register a mosque.<br />
              {user && user.role === "committee" && !user.isVerified && (
                <span>Your account is pending verification by a system admin.</span>
              )}
            </div>
          ) : (
            <MosqueRegistrationForm />
          )}
        </div>
      </div>
    </section>
  );
};

export default RegisterMosque;
