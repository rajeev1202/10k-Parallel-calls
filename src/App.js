import React, { useState, useEffect } from 'react';
import PokemonCard from './PokemonCard';

const containerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '16px',
  padding: '16px'
};

const fetchWithRetry = async (url, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      if (attempt === retries) throw error;
    }
  }
};

const App = () => {
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batchSize, setBatchSize] = useState(100);
  const totalPokemons = 10000;
  const totalBatches = Math.ceil(totalPokemons / batchSize);

  useEffect(() => {
    const fetchPokemonBatch = async (batchNumber) => {
      try {
        const start = batchNumber * batchSize + 1;
        const end = Math.min(start + batchSize - 1, totalPokemons);

        const idsData = await fetchWithRetry(`https://pokeapi.co/api/v2/pokemon?offset=${start - 1}&limit=${batchSize}`);
        const ids = idsData.results.map(pokemon => {
          const id = pokemon.url.split('/').slice(-2, -1)[0];
          return id;
        });

        const detailsRequests = ids.map(id => fetchWithRetry(`https://pokeapi.co/api/v2/pokemon/${id}`));
        const results = await Promise.allSettled(detailsRequests);

        const successfulResponses = results
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value);
        const failedResponses = results
          .filter(result => result.status === 'rejected')
          .map(result => result.reason);

        setPokemonList(prevList => [...prevList, ...successfulResponses]);
        const failedRequests = failedResponses.map(failedRequest => 
          fetchWithRetry(failedRequest.url)
        );

        if (failedRequests.length > 0) {
          const retryResults = await Promise.allSettled(failedRequests);
          const retriedSuccessfulResponses = retryResults
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value);
          const retriedFailedResponses = retryResults
            .filter(result => result.status === 'rejected')
            .map(result => result.reason);

          setPokemonList(prevList => [...prevList, ...retriedSuccessfulResponses]);
          retriedFailedResponses.forEach(error => console.error('Failed to fetch Pokémon details after retry:', error));
        }

        if (batchNumber < totalBatches - 1) {
          fetchPokemonBatch(batchNumber + 1);
        } else {
          setLoading(false); 
        }
      } catch (error) {
        console.error('Error fetching Pokémon batch:', error);
        setLoading(false);
      }
    };

    fetchPokemonBatch(0);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={containerStyle}>
      {pokemonList.map(pokemon => (
        <PokemonCard key={pokemon.id} pokemon={pokemon} />
      ))}
    </div>
  );
};

export default App;
