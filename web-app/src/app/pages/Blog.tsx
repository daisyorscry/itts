import { motion } from 'motion/react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Badge } from '@components/ui/badge';
import { ImageWithFallback } from '@components/figma/ImageWithFallback';

export function Blog() {
  const articles = [
    {
      id: 1,
      title: "Getting Started with Kubernetes: A Beginner's Guide",
      excerpt: 'Learn the fundamentals of container orchestration and deploy your first application to a Kubernetes cluster.',
      author: 'Ahmad Rizki',
      role: 'DevOps Engineer',
      date: 'March 10, 2026',
      readTime: '8 min read',
      tags: ['DevSecOps', 'Kubernetes', 'Tutorial'],
      image: 'https://images.unsplash.com/photo-1582192904915-d89c7250b235',
    },
    {
      id: 2,
      title: 'Building Secure REST APIs with Node.js',
      excerpt: 'Best practices for authentication, authorization, and data validation in your backend applications.',
      author: 'Budi Santoso',
      role: 'Full-Stack Developer',
      date: 'March 8, 2026',
      readTime: '12 min read',
      tags: ['Programming', 'Security', 'Node.js'],
      image: 'https://images.unsplash.com/photo-1772971919689-c216435a5899',
    },
    {
      id: 3,
      title: 'Network Troubleshooting: Tools and Techniques',
      excerpt: 'Master the essential tools and methodologies for diagnosing and resolving network issues efficiently.',
      author: 'Diana Putri',
      role: 'Network Administrator',
      date: 'March 5, 2026',
      readTime: '10 min read',
      tags: ['Networking', 'Tools', 'Guide'],
      image: 'https://images.unsplash.com/photo-1760611656615-db3fad24a314',
    },
    {
      id: 4,
      title: 'My Journey from Student to DevOps Engineer',
      excerpt: 'A personal story of growth, challenges, and lessons learned during my transition into the tech industry.',
      author: 'Sarah Lestari',
      role: 'Security Analyst',
      date: 'March 2, 2026',
      readTime: '6 min read',
      tags: ['Career', 'Story', 'DevSecOps'],
      image: 'https://images.unsplash.com/photo-1518107616985-bd48230d3b20',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-black text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Community <span className="text-accent">Blog</span>
            </h1>
            <p className="text-xl text-white/70">
              Insights, tutorials, and stories from our community of learners and tech professionals.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            {['All', 'Tutorials', 'Career Stories', 'Best Practices', 'News', 'Events'].map((cat, i) => (
              <button
                key={i}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  i === 0
                    ? 'bg-accent text-black'
                    : 'bg-background border border-border hover:border-accent hover:text-accent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-16 md:py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-background rounded-3xl overflow-hidden border border-border">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-64 lg:h-auto">
                <ImageWithFallback
                  src={articles[0].image}
                  alt={articles[0].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-accent text-black border-0">Featured</Badge>
                </div>
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8 md:p-12">
                <div className="flex flex-wrap gap-2 mb-4">
                  {articles[0].tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{articles[0].title}</h2>
                <p className="text-foreground/70 mb-6">{articles[0].excerpt}</p>
                <div className="mb-6 flex flex-col gap-3 text-sm text-foreground/60 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>{articles[0].author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{articles[0].date}</span>
                  </div>
                  <span>{articles[0].readTime}</span>
                </div>
                <button className="inline-flex items-center text-accent hover:underline font-medium">
                  Read full article <ArrowRight className="ml-2" size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12">Latest Articles</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice(1).map((article, i) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-3xl overflow-hidden border border-border hover:border-accent/50 transition-all group cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {article.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-foreground/70 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                  <div className="flex flex-col gap-3 text-xs text-foreground/60 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="font-medium text-foreground">{article.author}</div>
                      <div>{article.role}</div>
                    </div>
                    <div className="sm:text-right">
                      <div>{article.date}</div>
                      <div>{article.readTime}</div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="px-8 py-3 border-2 border-border hover:border-accent hover:text-accent rounded-full font-semibold transition-colors">
              Load More Articles
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
          <p className="text-lg text-white/70 mb-8">
            Get the latest articles, tutorials, and community updates delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button className="px-8 py-3 bg-accent text-black rounded-full font-semibold hover:bg-accent/90 transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
