import React, { useEffect, useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import CardSkeleton from '../Skeletons/CardSkeleton';
import { MdLayers } from 'react-icons/md'; // For the stacked/layered icon
import { FaPlay } from 'react-icons/fa'; // For the heart icon
import { BiSolidLike } from 'react-icons/bi';
import { Anime } from '../../hooks/interface';

const slideUpAnimation = keyframes`
  0% { opacity: 0.4; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const slideRightAnimation = keyframes`
  0% { opacity: 0.4; transform: translateX(-10px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const StyledCardWrapper = styled.div`
  animation: ${slideUpAnimation} 0.4s ease;
  &:hover {
    z-index: 2;
  }
`;

const StyledCardItem = styled.div`
  width: 100%;
  border-radius: var(--global-border-radius);
  cursor: pointer;
  transform: scale(1);
  transition: 0.2s ease-in-out;
`;

const ImageDisplayWrapper = styled.div`
  transition: 0.2s ease-in-out;
  @media (min-width: 501px) {
    &:hover {
      transform: translateY(-10px);
    }
  }
`;

const AnimeImage = styled.div<{}>`
  position: relative;
  text-align: left;
  overflow: hidden;
  border-radius: var(--global-border-radius);
  padding-top: calc(100% * 184 / 133);
  background: var(--global-card-bg);
  box-shadow: 2px 2px 10px var(--global-card-shadow);
  transition: background-color 0.2s ease-in-out;
  animation: ${slideUpAnimation} 0.5s ease forwards;
`;

const PlayIcon = styled(FaPlay)`
  position: absolute;
  top: 50%;
  left: 50%;
  color: #fff;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
`;

const ImageWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: var(--global-border-radius);
    transition: 0.3s ease-in-out;
    transition: filter 0.3s ease-in-out; // Ensure the filter transition is smooth
  }

  &:hover img {
    filter: brightness(0.5); // Decrease brightness to 60% on hover
  }

  &:hover ${PlayIcon} {
    opacity: 1;
  }
`;

const TitleContainer = styled.div<{ $isHovered: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  margin-top: 0.35rem;
  border-radius: var(--global-border-radius);
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: var(--global-card-title-bg);
  }
`;

const IndicatorDot = styled.div`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  margin-right: 0.5rem;
`;

const Dot = styled(IndicatorDot)`
  background-color: #aaff00;
  flex-shrink: 0;
`;

const CompletedIndicator = styled(IndicatorDot)`
  background-color: #00aaff;
  flex-shrink: 0;
`;

const Title = styled.h5<{ $isHovered: boolean; color?: string }>`
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: ${(props) => (props.$isHovered ? props.color : 'var(--title-color)')};
  transition: 0.2s ease-in-out;

  @media (max-width: 500px) {
    font-size: 0.7rem;
  }
`;

const ImgDetail = React.memo(styled.p<{ $isHovered: boolean; color?: string }>`
  animation: ${slideRightAnimation} 0.2s ease forwards;
  position: absolute;
  bottom: 0;
  margin: 0.25rem;
  padding: 0.2rem;
  font-size: 0.8rem;
  font-weight: bold;
  color: ${(props) => (props.color)};
  opacity: 0.9;
  background-color: var(--global-button-shadow);
  border-radius: 0.3rem;
  backdrop-filter: blur(10px);
  transition: 0.2s ease-in-out;
`);

const CardDetails = styled.div`
  animation: ${slideRightAnimation} 0.4s ease forwards;
  width: 100%;
  font-family: Arial;

  font-weight: bold;
  font-size: 0.75rem;
  color: rgba(102, 102, 102, 0.75);
  opacity: 0.65;
  margin: 0;
  display: flex;
  align-items: center;
  padding: 0.25rem 0rem;
  gap: 0.5rem;

  white-space: nowrap;
  overflow: hidden; // Ensures that overflow text is hidden
  text-overflow: ellipsis; // Adds an ellipsis to indicate that text has been cut off
`;

const CardItemContent: React.FC<{ anime: Anime }> = ({ anime }) => {
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [anime.id]);

  const handleCardClick = () => {
    navigate(`/watch/${anime.id}`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const imageSrc = anime.coverImage || anime.image || '';
  const animeColor = anime.color || '#999999';
  const displayTitle = useMemo(
    () => anime.title.english || anime.title.romaji || 'No Title',
    [anime.title.english, anime.title.romaji],
  );

  const truncateTitle = useMemo(
    () => (title: string, maxLength: number) =>
      title.length > maxLength ? `${title.slice(0, maxLength)}...` : title,
    [],
  );

  const handleStatusCheck = useMemo(() => {
    switch (anime.status) {
      case 'Ongoing':
      case 'RELEASING':
        return <Dot />;
      case 'Completed':
      case 'FINISHED':
        return <CompletedIndicator />;
      default:
        return null;
    }
  }, [anime.status]);

  const handleImageLoad = () => {
    setLoading(false); // Set loading to false when image is loaded
  };

  const displayDetail = useMemo(() => {
    // Any complex logic can go here
    return (
      <ImgDetail $isHovered={isHovered} color={anime.color}>
        {anime.type}
      </ImgDetail>
    );
  }, [isHovered, anime.color, anime.type]);

  return (
    <>
      {loading ? (
        <CardSkeleton />
      ) : (
        <StyledCardWrapper
          onClick={handleCardClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          color={animeColor}
          title={anime.title.english || anime.title.romaji}
        >
          <StyledCardItem>
            <ImageDisplayWrapper>
              <AnimeImage>
                <ImageWrapper>
                  <img
                    src={imageSrc}
                    onLoad={handleImageLoad}
                    loading='eager'
                    alt={
                      anime.title.english || anime.title.romaji + ' Cover Image'
                    }
                  />
                  <PlayIcon
                    title={
                      'Play ' + (anime.title.english || anime.title.romaji)
                    }
                  />
                </ImageWrapper>
                {isHovered && displayDetail}
              </AnimeImage>
            </ImageDisplayWrapper>
            <TitleContainer $isHovered={isHovered}>
              {handleStatusCheck}
              <Title
                $isHovered={isHovered}
                color={anime.color}
                title={'Title: ' + (anime.title.english || anime.title.romaji)}
              >
                {truncateTitle(displayTitle, 35)}
              </Title>
            </TitleContainer>
            <div>
              <CardDetails title='Romaji Title'>
                {' '}
                {truncateTitle(anime.title.romaji || '', 24)}{' '}
              </CardDetails>
              <CardDetails title='Card Details'>
                <div>{anime.releaseDate}</div>
                <div>
                  <MdLayers />
                  {anime.totalEpisodes || anime.episodes}
                </div>
                <div>
                  <BiSolidLike />
                  {anime.rating / 10}
                </div>
              </CardDetails>
            </div>
          </StyledCardItem>
        </StyledCardWrapper>
      )}
    </>
  );
};

export default CardItemContent;
