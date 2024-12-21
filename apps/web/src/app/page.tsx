'use client';

import api from "@/lib/api";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  const [foundMemes, setFoundMemes] = useState<{ imageUrl: string; text: string; }[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const queryMeme = async (term: string) => {
    try {
      setIsLoading(true);

      const { data } = await api.get('/meme-image/search', {
        params: {
          query: term
        }
      });

      console.log(data);
      setFoundMemes(data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAllMemes = async () => {
    try {
      setIsLoading(true);

      const { data } = await api.get('/meme-image');

      console.log(data);
      setFoundMemes(data.data.memes);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (debouncedTerm) {
      queryMeme(debouncedTerm)
    } else {
      getAllMemes();
    }
  }, [debouncedTerm]);

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Pesquisar por memes"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <button 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              onClick={ () => queryMeme(searchTerm) }
            >
              Procurar
            </button>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-sm font-semibold text-gray-500 mb-4">
                Resultados
              </h2>

              <div className="relative">
                <div 
                  className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${ isLoading && 'opacity-10 pointer-events-none' }`}
                >
                  {
                    foundMemes.length > 0
                    ? foundMemes.map((meme, index) => (
                      <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-4">
                          <Image
                            priority
                            src={meme.imageUrl}
                            alt={meme.text.replaceAll('\n', ' ')}
                            width={200}
                            height={200}
                            className="w-full rounded-lg"
                            unoptimized
                          />
                        </div>
                        <div className="flex justify-between items-center p-4 pt-0">
                          <a
                            href={meme.imageUrl}
                            download
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors"
                          >
                            Baixar
                          </a>
                        </div>
                      </div>
                    ))
                    : <p>Não foi encontrado <span className="italic">{ searchTerm }</span></p>
                  }
                </div>

                {
                  isLoading && (
                    <div className="absolute top-40 left-0 right-0 flex items-center justify-center">
                        <svg 
                          aria-hidden="true" 
                          className="w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" 
                          viewBox="0 0 100 101" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" 
                            fill="currentColor"
                          />
                          <path 
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" 
                            fill="currentFill"
                          />
                      </svg>
                    </div>
                  )
                }
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
