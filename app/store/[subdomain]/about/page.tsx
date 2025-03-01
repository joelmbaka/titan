import { getStoreBySubdomain } from '@/lib/storeFunctions.server';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function StoreAboutPage({ params }: PageProps) {
  try {
    // Await the params promise
    const { subdomain } = await params;
    console.log('StoreAboutPage - Subdomain:', subdomain);

    const store = await getStoreBySubdomain(subdomain);
    console.log('StoreAboutPage - Store data:', store);

    if (!store) {
      console.log('StoreAboutPage - Store not found');
      return notFound();
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">About {store.name}</h1>
            <p className="text-gray-600">Learn more about our company and mission</p>
          </div>

          {/* Company Overview */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="text-gray-700 mb-4">
              Founded in 2023, {store.name} has been at the forefront of innovation in the {store.industry?.toLowerCase().replace(/_/g, ' ') || 'industry'} sector. 
              We started with a simple mission: to provide high-quality products that make a difference in people's lives.
            </p>
            <p className="text-gray-700 mb-4">
              What began as a small operation has grown into a trusted brand with customers across the globe. 
              Our commitment to excellence, sustainability, and customer satisfaction remains at the core of everything we do.
            </p>
            <p className="text-gray-700">
              Today, we continue to expand our product line while maintaining the same attention to detail and quality that has defined our brand from day one.
            </p>
          </div>

          {/* Mission & Values */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Mission & Values</h2>
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-2">Mission</h3>
              <p className="text-gray-700">
                To provide innovative, high-quality products that enhance our customers' lives while maintaining a commitment to ethical business practices and environmental responsibility.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Core Values</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li><span className="font-medium">Quality Excellence:</span> We never compromise on the quality of our products.</li>
                <li><span className="font-medium">Customer Focus:</span> Our customers are at the center of everything we do.</li>
                <li><span className="font-medium">Integrity:</span> We conduct business with honesty, transparency, and ethical standards.</li>
                <li><span className="font-medium">Innovation:</span> We continuously seek new ways to improve and evolve.</li>
                <li><span className="font-medium">Sustainability:</span> We are committed to environmentally responsible practices.</li>
              </ul>
            </div>
          </div>

          {/* Team Section */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold mb-6">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Team Member 1 */}
              <div className="text-center">
                <div className="bg-gray-100 h-40 w-40 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-500">Photo</span>
                </div>
                <h3 className="font-semibold text-lg">Jane Doe</h3>
                <p className="text-blue-600">Founder & CEO</p>
                <p className="text-gray-600 text-sm mt-2">
                  With over 15 years of experience in the industry, Jane leads our company with vision and passion.
                </p>
              </div>
              
              {/* Team Member 2 */}
              <div className="text-center">
                <div className="bg-gray-100 h-40 w-40 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-500">Photo</span>
                </div>
                <h3 className="font-semibold text-lg">John Smith</h3>
                <p className="text-blue-600">Chief Product Officer</p>
                <p className="text-gray-600 text-sm mt-2">
                  John oversees product development, ensuring that every item meets our high standards of quality.
                </p>
              </div>
              
              {/* Team Member 3 */}
              <div className="text-center">
                <div className="bg-gray-100 h-40 w-40 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-500">Photo</span>
                </div>
                <h3 className="font-semibold text-lg">Emily Johnson</h3>
                <p className="text-blue-600">Customer Experience Director</p>
                <p className="text-gray-600 text-sm mt-2">
                  Emily ensures that every customer interaction with our brand exceeds expectations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('StoreAboutPage - Error:', error);
    throw error;
  }
} 