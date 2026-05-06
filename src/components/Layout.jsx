export default function Layout({ children }) {
  return (
    <main className="site-main">
      <div className="container">{children}</div>
    </main>
  );
}
