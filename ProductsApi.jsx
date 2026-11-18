export default function ProductsApi({ products = [], error = '' }) {
  if (error) return <p>حصل خطأ: {error}</p>;

  return (
    <div>
      {products.map((product) => (
        <article key={product.id}>
          <h2>{product.name}</h2>
          <p>${product.price}</p>
        </article>
      ))}
    </div>
  );
}
