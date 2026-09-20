import { getAllProducts } from '@/lib/products';
import AppShell from './AppShell';

export default function HomePage() {
  const products = getAllProducts();
  return <AppShell initialProducts={products} />;
}
