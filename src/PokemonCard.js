import React from 'react';
import './PokemonCard.css';

const PokemonCard = ({ pokemon }) => {
  return (
    <div className="pokemon-card">
      <div className="pokemon-image">
        <img src={pokemon.sprites.front_default} alt={pokemon.name} />
      </div>
      <div className="pokemon-details">
        <h3>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
        <p>ID: {pokemon.id}</p>
        <p>Height: {pokemon.height / 10} m</p>
        <p>Weight: {pokemon.weight / 10} kg</p>
        <p>Types: {pokemon.types.map(typeInfo => typeInfo.type.name).join(', ')}</p>
      </div>
    </div>
  );
};

export default PokemonCard;