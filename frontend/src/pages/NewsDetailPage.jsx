import { useParams } from "react-router-dom";

const NewsDetailPage = ({ news }) => {
  const { id } = useParams();
  const article = news[parseInt(id)];

  if (!article) {
    return <p>News article not found.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{article.title}</h1>
      <img src={article.image} alt={article.title} className="my-4" />
      <p>{article.description}</p>
      <p className="text-gray-600">{new Date(article.published_at).toLocaleString()}</p>
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-[--accent-color] underline">
        Read Full Article
      </a>
    </div>
  );
};

export default NewsDetailPage;
