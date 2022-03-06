import { GetStaticProps } from 'next';

import { FiCalendar, FiUser } from 'react-icons/fi';

import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';
import Header from '../components/Header';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  formattedDate: string;
  slugs: string[];
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  // TODO
  const { results, next_page } = postsPagination;
  return (
    <div className={`${styles.appContainer} ${commonStyles.appContainer}`}>
      <Header />
      <ul className={styles.travellingList}>
        {results.map(post => (
          <Link href={`/post/${post.slugs[0]}`}>
            <li key={post.uid} className={styles.travellingItem}>
              <h2 className={styles.heading_2}>{post.data.title}</h2>
              <p className={styles.description}>{post.data.subtitle}</p>
              <div className={styles.travellingInfo}>
                <time>
                  <FiCalendar />
                  {post.formattedDate}
                </time>
                <span>
                  <FiUser />
                  {post.data.author}
                </span>
              </div>
            </li>
          </Link>
        ))}
      </ul>
      {next_page ? (
        <Link href={next_page}>
          <a className={styles.loadMorePostsLink}>Carregar mais posts</a>
        </Link>
      ) : (
        ''
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    { pageSize: 5 }
  );
  const postsPagination = postsResponse.results;

  const formatDate = (date: Date): string =>
    format(date, 'dd MMM yyyy', { locale: ptBR });
  const formattedPosts = postsPagination.map(post => ({
    formattedDate: formatDate(new Date(post.first_publication_date)),
    ...post,
  }));
  return {
    props: {
      postsPagination: {
        results: formattedPosts,
        next_page: postsResponse.next_page,
      },
    },
  };
};
