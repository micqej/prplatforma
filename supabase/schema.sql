-- Categories
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL
);

-- Articles
CREATE TABLE articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text,
  category_id uuid REFERENCES categories(id),
  cover_image_url text,
  published_at timestamptz DEFAULT now(),
  view_count integer DEFAULT 0,
  read_time_minutes integer DEFAULT 3,
  status text DEFAULT 'published'
);

-- Article views (for live counter)
CREATE TABLE article_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES articles(id),
  viewed_at timestamptz DEFAULT now(),
  session_id text
);

-- Profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;

-- articles: anyone can read, only owner can write
CREATE POLICY "articles_select" ON articles FOR SELECT USING (true);
CREATE POLICY "articles_insert" ON articles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "articles_update" ON articles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "articles_delete" ON articles FOR DELETE USING (auth.uid() = user_id);

-- profiles: anyone can read, only owner can write
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- categories: read-only for all
CREATE POLICY "categories_select" ON categories FOR SELECT USING (true);

-- article_views: anyone can insert, anyone can read
CREATE POLICY "views_select" ON article_views FOR SELECT USING (true);
CREATE POLICY "views_insert" ON article_views FOR INSERT WITH CHECK (true);

-- Seed categories
INSERT INTO categories (name, slug) VALUES
  ('Marketing', 'marketing'),
  ('IT & technológie', 'it-technologie'),
  ('Financie', 'financie'),
  ('Podnikanie', 'podnikanie'),
  ('Nehnuteľnosti', 'nehnutelnosti'),
  ('Zdravie', 'zdravie'),
  ('Právo', 'pravo');

-- RPC to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(article_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE articles SET view_count = view_count + 1 WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
