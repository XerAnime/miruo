import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  useNavigate,
  useSearchParams,
  Link,
  useLocation,
} from 'react-router-dom';
import DropDownSearch from './DropDownSearch';
import { fetchAdvancedSearch } from '../hooks/useApi';
import { FiSun, FiMoon, FiX, FiMenu } from 'react-icons/fi';
import { GoCommandPalette } from 'react-icons/go';
import { IoIosSearch } from 'react-icons/io';
import { Anime } from '../hooks/interface';

const fadeInAnimation = (color: string) => keyframes`
  from { background-color: transparent; }
  to { background-color: ${color}; }
`;

const slideDownAnimation2 = keyframes`
  0% { opacity: 0; transform: translateY(-20px); max-height: 0; }
  100% { opacity: 1; transform: translateY(0); max-height: 500px; } /* Example max-height */
`;

const StyledNavbar = styled.div<{ $isExtended?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  text-align: center;
  margin: 0;
  padding: 1rem;
  background-color: var(--global-primary-bg-tr);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 100;
  animation: ${fadeInAnimation('var(--global-primary-bg-tr)')} 0.5s ease-out;
  transition: 0.1s ease-in-out;

  @media (max-width: 1000px) {
    padding: 1rem 0.5rem;
  }
`;

const TopContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
`;

const LogoImg = styled(Link)`
  width: 7rem;
  font-size: 1.2rem;
  font-weight: bold;
  text-decoration: none;
  color: var(--global-text);
  content: var(--logo-text-transparent);
  cursor: pointer;
  transition:
    color 0.2s ease-in-out,
    transform 0.2s ease-in-out;

  &:hover {
    color: black;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 500px) {
    max-width: 6rem;
  }
`;

const InputContainer = styled.div<{ $isVisible: boolean }>`
  display: flex;
  flex: 1;
  max-width: 35rem;
  height: 1.2rem;
  align-items: center;
  padding: 0.6rem;
  border-radius: var(--global-border-radius);
  background-color: var(--global-div);
  animation: ${fadeInAnimation('var(--global-div)')} 0.1s ease-out;
  animation: ${slideDownAnimation2} 0.5s ease;

  @media (max-width: 1000px) {
    max-width: 30rem;
  }

  @media (max-width: 500px) {
    max-width: 100%;
    margin-top: 1rem;
    display: ${({ $isVisible }) => ($isVisible ? 'flex' : 'none')};
  }
`;

const RightContent = styled.div`
  gap: 0.5rem;
  display: flex;
  align-items: center;
  height: 2rem;
`;

const Icon = styled.div<{ $isFocused: boolean }>`
  margin: 0;
  padding: 0 0.25rem;
  color: var(--global-text);
  opacity: ${({ $isFocused }) => ($isFocused ? 1 : 0.5)};
  font-size: 1.2rem;
  transition: opacity 0.2s;
  max-height: 100%;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  background: transparent;
  border: none;
  color: var(--global-text);
  display: inline-block;
  font-size: 0.85rem;
  outline: 0;
  padding: 0;
  max-height: 100%;
  display: flex;
  align-items: center;
  padding-top: 0;
  width: 100%;
  transition:
    border-color 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
`;

const ClearButton = styled.button<{ $query: string }>`
  background: transparent;
  border: none;
  color: var(--global-text);
  font-size: 1.2rem;
  cursor: pointer;
  opacity: ${({ $query }) => ($query ? 0.5 : 0)};
  visibility: ${({ $query }) => ($query ? 'visible' : 'hidden')};
  transition:
    color 0.2s,
    opacity 0.2s;
  max-height: 100%;
  display: flex;
  align-items: center;

  &:hover {
    color: var(--global-text);
    opacity: 1;
  }
`;

const StyledButton = styled.button<{ isInputToggle?: boolean }>`
  background: transparent;
  background-color: var(--global-div);
  color: var(--global-text);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 1.2rem 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.3rem;
  width: 100%;
  height: 100%;
  transition:
    color 0.2s ease-in-out,
    transform 0.1s ease-in-out;
  border: none;

  &:active {
    transform: scale(0.9);
  }

  @media (max-width: 500px) {
    display: flex;
    margin: ${({ isInputToggle }) => (isInputToggle ? '0' : '0')};
  }
`;

const SlashToggleBtn = styled.div<{ $isFocused: boolean }>`
  font-size: 1.2rem;
  cursor: pointer;
  opacity: ${({ $isFocused }) => ($isFocused ? 1 : 0.5)};

  &:hover {
    opacity: 1;
  }

  @media (max-width: 1000px) {
    display: none;
  }
`;

const detectUserTheme = () => {
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return true;
  }
  return false;
};

const saveThemePreference = (isDarkMode: boolean) => {
  localStorage.setItem('themePreference', isDarkMode ? 'dark' : 'light');
};

const getInitialThemePreference = () => {
  const storedThemePreference = localStorage.getItem('themePreference');

  if (storedThemePreference) {
    return storedThemePreference === 'dark';
  }

  return detectUserTheme();
};

const Navbar = () => {
  const [isPaddingExtended, setIsPaddingExtended] = useState(false);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [inputContainerWidth, setInputContainerWidth] = useState(0);
  const [searchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const navbarRef = useRef(null);
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for the dropdown container
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const debounceTimeout = useRef<Timer | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [search, setSearch] = useState({
    isSearchFocused: false,
    searchQuery: searchParams.get('query') || '',
    isDropdownOpen: false,
  });
  const [isInputVisible, setIsInputVisible] = useState(false); // Default to false
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 500);
  const fetchSearchResults = async (query: string) => {
    if (!query.trim()) return;

    try {
      const fetchedData = await fetchAdvancedSearch(query, 1, 5); // Fetch first 5 results for the dropdown
      const formattedResults = fetchedData.results.map((anime: Anime) => ({
        id: anime.id, // Make sure to include the ID field
        title: anime.title,
        image: anime.image,
        type: anime.type,
        totalEpisodes: anime.totalEpisodes,
        rating: anime.rating,
      }));
      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Failed to fetch search results:', error);
      setSearchResults([]);
    }
  };

  const handleCloseDropdown = () => {
    setSearch((prevState) => ({
      ...prevState,
      isDropdownOpen: false,
    }));
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      handleCloseDropdown();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [isDarkMode, setIsDarkMode] = useState(getInitialThemePreference());

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === '/' && inputRef.current) {
        e.preventDefault();
        inputRef.current.focus();
        setSearch((prevState) => ({
          ...prevState,
          isSearchFocused: true,
        }));
      } else if (e.key === 'Escape' && inputRef.current) {
        inputRef.current.blur();
        setSearch((prevState) => ({
          ...prevState,
          isSearchFocused: false,
        }));
        handleCloseDropdown(); // Close dropdown on Escape key
      } else if (e.shiftKey && e.key.toLowerCase() === 'd') {
        if (document.activeElement !== inputRef.current) {
          e.preventDefault();
          toggleTheme();
        }
      }
    },
    [search, isDarkMode],
  );

  useEffect(() => {
    const listener = handleKeyDown as EventListener;
    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    setSearch({ ...search, searchQuery: searchParams.get('query') || '' });
  }, [searchParams]);

  const navigateWithQuery = useCallback(
    (value: string) => {
      navigate(value ? `/search?query=${value}` : '/search');
    },
    [navigate],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearch({ ...search, searchQuery: newValue });

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      fetchSearchResults(newValue);
      setSearch((prevState) => ({
        ...prevState,
        isDropdownOpen: true,
      }));
    }, 100);
  };

  const handleKeyDownOnInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default form submission behavior
      if (selectedIndex !== null && searchResults[selectedIndex]) {
        // Navigate to the selected search result if it exists
        const animeId = searchResults[selectedIndex].id;
        navigate(`/watch/${animeId}`);
        handleCloseDropdown();
      } else {
        // Fallback to navigating with the search query if the selected index is not in searchResults
        navigateWithQuery(search.searchQuery);
      }
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      setSearch((prevState) => ({
        ...prevState,
        isDropdownOpen: false,
      }));
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  useEffect(() => {
    // Function to update the width
    const updateWidth = () => {
      if (inputContainerRef.current) {
        setInputContainerWidth(inputContainerRef.current.offsetWidth);
      }
    };

    // Update width on mount
    updateWidth();

    // Add event listener for window resize
    window.addEventListener('resize', updateWidth);

    // Cleanup function to remove the event listener
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    // This effect runs when the location.pathname changes or enter is pressed (Hide the InputContainer)
    if (isMobileView) {
      setIsInputVisible(false);
    }
  }, [location.pathname, isMobileView]);

  const handleClearSearch = () => {
    setSearch((prevState) => ({
      ...prevState,
      searchQuery: '',
    }));
    setSearchResults([]);
    setSearch((prevState) => ({
      ...prevState,
      isDropdownOpen: false, // Close dropdown when search is cleared
    }));
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    saveThemePreference(newIsDarkMode);
  };
  useEffect(() => {
    function handleResize() {
      setIsMobileView(window.innerWidth < 500);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  //navigate to preferences
  const navigateToPreferences = () => {
    // Check if the current location's pathname is not '/preferences' before navigating
    if (location.pathname !== '/preferences') {
      navigate('/preferences');
    }
  };

  return (
    <>
      <StyledNavbar $isExtended={isPaddingExtended} ref={navbarRef}>
        <TopContainer>
          <LogoImg
            title='MIRURO.tv'
            to='/home'
            onClick={() => window.scrollTo(0, 0)}
          >
            見るろ の 久遠
          </LogoImg>

          {/* Render InputContainer within the navbar for screens larger than 500px */}
          {!isMobileView && (
            <InputContainer ref={inputContainerRef} $isVisible={isInputVisible}>
              <Icon $isFocused={search.isSearchFocused}>
                <IoIosSearch />
              </Icon>
              <SearchInput
                type='text'
                placeholder='Search Anime'
                value={search.searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDownOnInput}
                onFocus={() => {
                  setSearch((prevState) => ({
                    ...prevState,
                    isDropdownOpen: true,
                    isSearchFocused: true,
                  }));
                }}
                ref={inputRef}
                aria-label='Search Anime'
              />
              <DropDownSearch
                searchResults={searchResults}
                onClose={handleCloseDropdown}
                isVisible={search.isDropdownOpen}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                searchQuery={search.searchQuery}
                containerWidth={inputContainerWidth}
              />

              <ClearButton
                $query={search.searchQuery}
                onClick={handleClearSearch}
                aria-label='Clear Search'
              >
                <FiX />
              </ClearButton>
              <Icon $isFocused={search.isSearchFocused}>
                <GoCommandPalette />
              </Icon>
            </InputContainer>
          )}
          <RightContent>
            {isMobileView && (
              <StyledButton
                onClick={() => {
                  setIsInputVisible((prev) => !prev);
                  setIsPaddingExtended((prev) => !prev); // Toggle padding extension when toggling input visibility
                }}
                aria-label='Toggle Search Input'
              >
                <IoIosSearch />
              </StyledButton>
            )}
            <StyledButton onClick={toggleTheme} aria-label='Toggle Dark Mode'>
              {isDarkMode ? <FiSun /> : <FiMoon />}
            </StyledButton>
            {/* <StyledButton onClick={navigateToPreferences}>
              <FiMenu />
            </StyledButton> */}
          </RightContent>
        </TopContainer>

        {isMobileView && isInputVisible && (
          <InputContainer $isVisible={isInputVisible}>
            <Icon $isFocused={search.isSearchFocused}>
              <IoIosSearch />
            </Icon>
            <SearchInput
              type='text'
              placeholder='Search Anime'
              value={search.searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDownOnInput}
              onFocus={() => {
                setSearch((prevState) => ({
                  ...prevState,
                  isDropdownOpen: true,
                  isSearchFocused: true,
                }));
              }}
              ref={inputRef}
            />
            <DropDownSearch
              searchResults={searchResults}
              onClose={handleCloseDropdown}
              isVisible={search.isDropdownOpen}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              searchQuery={search.searchQuery}
              containerWidth={inputContainerWidth}
            />

            <ClearButton
              $query={search.searchQuery}
              onClick={handleClearSearch}
            >
              <FiX />
            </ClearButton>
            <SlashToggleBtn $isFocused={search.isSearchFocused}>
              <GoCommandPalette />
            </SlashToggleBtn>
          </InputContainer>
        )}
      </StyledNavbar>
      {/* Conditionally render InputContainer below the navbar for mobile view when visibility is toggled */}
    </>
  );
};

export default Navbar;
