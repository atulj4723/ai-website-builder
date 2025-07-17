type CardProps = {
    title: string;
    desc: string;
  };
  
  const Card = ({ title, desc }: CardProps) => {
    return (
      <div className="bg-white/80 backdrop-blur shadow-md rounded-2xl p-6 transition hover:shadow-xl hover:-translate-y-1">
        <h2 className="text-2xl font-semibold text-blue-700 mb-2">{title}</h2>
        <p className="text-gray-600">{desc}</p>
      </div>
    );
  };
  
  export default Card;
  