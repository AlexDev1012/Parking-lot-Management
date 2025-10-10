import "./Loading.css";
import { Oval } from "react-loader-spinner";

const Loading = () => {
  return (
    <section className="loading">
      <Oval
        visible={true}
        height="80"
        width="80"
        color="#3b82f6"
        secondaryColor="#22CBAD"
        ariaLabel="oval-loading"
        wrapperStyle={{}}
        wrapperClass=""
        strokeWidth="4"
      />
      <p className="mt-4">Loading...</p>
    </section>
  );
};

export default Loading;
