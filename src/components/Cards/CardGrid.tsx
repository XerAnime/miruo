import React, { useEffect } from 'react';
import styled from 'styled-components';
import CardItem from './CardItem';
import { Anime } from '../../hooks/interface';

interface CardGridProps {
  animeData: Anime[];
  hasNextPage: boolean;
  onLoadMore: () => void;
}

const CardGrid: React.FC<CardGridProps> = ({
  animeData,
  hasNextPage,
  onLoadMore,
}) => {
  const handleLoadMore = () => {
    if (hasNextPage) {
      onLoadMore();
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.offsetHeight;
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;

      const threshold = 1000;

      if (windowHeight + scrollTop >= documentHeight - threshold) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasNextPage]);

  return (
    <StyledCardGrid>
      {animeData.map((anime) => (
        <CardItem key={anime.id} anime={anime} />
      ))}
    </StyledCardGrid>
  );
};

export const StyledCardGrid = styled.div`
  margin: 0 auto;
  display: grid;
  position: relative;
  grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
  grid-template-rows: auto;
  gap: 2.75rem;
  transition: 0s;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
    gap: 2rem;
  }

  @media (max-width: 1000px) {
    gap: 1.5rem;
  }

  @media (max-width: 800px) {
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
    gap: 1.25rem;
  }

  @media (max-width: 450px) {
    grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
    gap: 0.9rem;
  }
`;

export default CardGrid;
