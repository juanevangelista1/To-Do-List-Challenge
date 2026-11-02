import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1>Page not found</h1>
      <p>The task or page you are looking for does not exist.</p>
      <Link href="/">Back to the list</Link>
    </>
  );
}
