import MosqueRegistrationForm from "@/components/mosque/MosqueRegistrationForm";

const RegisterMosque = () => {
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
          <MosqueRegistrationForm />
        </div>
      </div>
    </section>
  );
};

export default RegisterMosque;
