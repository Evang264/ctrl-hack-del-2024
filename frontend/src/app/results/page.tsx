import Navbar from "../../components/navbar";

export default function Results() {
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      <div>
        <h2>Live Results:</h2>
        <div className="border border-black rounded-2xl w-full h-96" />
      </div>
      <div>
        <h2>Results by Province:</h2>
        <div className="border border-black rounded-2xl w-full h-96" />
      </div>
      <div className="sm:col-span-2">
        <h2>Live Results:</h2>
        <div className="border border-black rounded-2xl w-full h-96" />
      </div>
    </div>
  );
}
