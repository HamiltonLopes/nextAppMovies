import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
// import SliderS from '../styles/Slider.module.css';
import Pagination from '../components/pagination';
import { args } from '../config/api';

interface IPropsComponent {
  list: any[];
  page: number;
  total_pages: number;
  search: boolean;
  searchParam: string;
}


const Home = (args: IPropsComponent) => {
  const [data, setData] = useState<any[]>([]);
  const [search,setSearch] = useState(args.searchParam);
  const [isClicked, setIsClicked] = useState(false);
  const [result, setResult] = useState<undefined | string>(undefined);
  const router = useRouter();

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    if (search)
      return router.push(`?search=${search}&page=${value}`);
    else return router.push(`?page=${value}`);
  };

  async function handleSearchMovie(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    return router.push(`/?search=${search}&page=1`);
  }

  useEffect(() => {
    setData(args.list);
    setResult(args.searchParam);
  }, [args.list, args.searchParam])

  return (
    <div className={styles.container}>
      <Head>
        <title>Projeto aula NextJS MovieDB</title>
        <meta name="description" content="Gerado pelo create next app"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      <div>
        <div className={styles.formSearch}>
          <form onSubmit={handleSearchMovie}>
            <input type="text" placeholder="Procure por um filme ou série..." onChange={(e) => setSearch(e.target.value)}/>
            <button type="submit">Pesquisar</button>
          </form>
        </div>

        <div className={styles.titleContainer}>
          {result ? (<h1>Resultados de busca para: {`${result}`}</h1>)
          : (<h1>Filmes Populares</h1>)}
        </div>

        <div className={styles.moviesCointainer}>
          {data.map((item: any, index: number) => (
            <div key={index}>
              <Image src={`http://image.tmdb.org/t/p/original${item.poster_path}`}
                alt="image movie"
                width={350}
                height={400}/>

              <div>
                {item.vote_average ? (
                  <p>
                    Nota: <span>{item.vote_average}</span>
                  </p>
                ) : (
                  <p>
                    Nota: <span>Sem avaliação</span>
                  </p>
                )}
              </div>
            </div>
          ))}

        </div>
      </div>

      <div className={styles.paginationContainer}>
        <Pagination
          total_pages={args.total_pages}
          page={args.page}
          handleChange={handleChange}
        />
      </div>
    </div>
  )
}

export default Home;


export async function getServerSideProps({ query }: { query: { page?: string; search?: string } }) {
  let response;
  if (query.search) {
    response = await fetch(
      `${args.base_url}/search/movie?api_key=${args.api_key}&query=${query.search}&page=${query.page ? query.page : 1}&language=pt-BR`
    );
  } else {
    response = await fetch(
      `${args.base_url}/trending/movie/week?api_key=${args.api_key}&page=${query.page ? query.page : 1}&language=pt-BR`
    );
  }
  const data = (await response.json()) as any;

  return {
    props: {
      list: data.results,
      page: data.page,
      total_pages: data.total_pages,
      searchParam: query.search ? query.search : ""
    }
  }
}