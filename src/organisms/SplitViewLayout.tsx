import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import ResizableSplitPane from './ResizableSplitPane.tsx';
import CodeEditor from './CodeEditor';

// Initial data with portfolio projects
const initialUserData = {
  personOfInterest: {
    name: "Anders Hofsten",
    occupation: "Frontend Developer",
    location: "Gothenburg, Sweden || Remote",
  },
  socialMedia: {
    linkedIn: "https://www.linkedin.com/in/ahofsten/",
    github: "https://github.com/gbsr",
  },
  infoBlurb: "I am a former technical audio designer turned frontend designer.",
  USP: [
    "Passionate about learning new techniques and technologies.",
    "Appreciate clean code",
    "Function over form",
  ],
  portfolioProjects: [
    {
      id: "jozye-kaya-art",
      title: "Jozye Kaya Art",
      url: "https://gbsr.github.io/kaffekid/",
      image: "./jozye_kaya_art.jpg",
      description: "Portfolio site for Jozye Kaya, abstract painter. She had no preferences, so I chose to pick the colorscheme based on her artworks, while keeping it as simple as possible."
    },
    {
      id: "qr-code-gen",
      title: "QR Code Gen",
      url: "https://gbsr.github.io/qr_code_gen/",
      image: "./QRCodeGen.jpg",
      description: "Made a small QR code generator, because I needed it for a personal thing."
    },
    {
      id: "webshop",
      title: "At the Beach",
      url: "https://gbsr.github.io/atTheBeach/",
      image: "./atTheBeach.jpg",
      description: "As part of our second course in JavaScript, we had to do a webshop with some certain criterias. It had to be responsive, (use React), had to list X amounts of products, and there had to be a login with an administrator mode and a shopping cart. Everything had to be synced using state-management and a database connection. When logged in as an administrator you should be able to either add/delete or change the content of the store."
    },
    {
      id: "studyplanner",
      title: "Study Planner",
      url: "https://gbsr.github.io/study-planner/",
      image: "./studyPlanner.jpg",
      description: "In our course about testing we got a somewhat broken version of a studyplanner, and had to use different testing frameworks and test-driven development to fix it into a working version. Since I immediately saw the value of this project, I also hooked it up to firebase for good measure, so I can use it for myself, as well as refactored some code. Clearing an item tells the database it is cleared and updates."
    },
    {
      id: "blog",
      title: "Pushing Pixels",
      url: "https://pushing-pixels.vercel.app/",
      image: "./blog3.jpg",
      description: "I wanted a blog to write down bits and pieces that I stumble across as I am exploring Frontend Development. So I took the opportunity to try and make a little more worthwhile React/NextJS project that I can actually use for something."
    },
    {
      id: "pokemon-manager",
      title: "Pokemon Team Manager",
      url: "https://gbsr.github.io/poke-team/",
      image: "./pokemonMan.jpg",
      description: "For the JavaScript Fundamentals continuation focusing on APIs, as a project for my Frontend Developer programme at NBI Handelsakademin, I developed a Pokemon Team Manager application using the PokeAPI. This project demonstrates my practical application of JavaScript fundamentals, showcasing the ability to integrate and manipulate data from external APIs."
    },
    {
      id: "ultraminimalistictodo",
      title: "Ultra minimalistic Todo App",
      url: "https://gbsr.github.io/todo-app/",
      image: "./ultraminimalistictodo.jpg",
      description: "In my exploration in JavaScript fundamentals, particularly local storage which opened up the potential of (somewhat) persistent data, I created an ultra minimalistic todo app. This was made purely as an exercise into local storage and DOM manipulation."
    },
    {
      id: "findThatMovie",
      title: "Find That Movie",
      url: "https://gbsr.github.io/find_that_movie/",
      image: "./findMovie.jpg",
      description: "As my first React project, I did a little app that lists movies, and their cover-art and sends you to IMDB in case you want more information about the movie. This was made purely as an exercise into React fundamentals. It uses the Open Movie DataBase for API calls."
    },
    {
      id: "gameProjects",
      title: "Game Projects",
      url: "#",
      image: "./resources/img/gameProjects/Project_Image_Expeditions_Rome_300x300.jpg",
      description: "I have also worked on numerous game projects, both designing audio, audio implementation, as well as making tools for faster workflow and world audio design. Including: Expeditions: Rome, Mutant Year Zero: Road to Eden, Gumslinger, and Totally Accurate Battlegrounds."
    }
  ]
};

// Main Component
const CodePenPortfolioLayout: React.FC = () => {
  // State for the editor content and parsed data
  const [code, setCode] = useState(JSON.stringify(initialUserData, null, 2));
  const [userData, setUserData] = useState(initialUserData);
  const [error, setError] = useState<string | null>(null);
const [previewWidth, setPreviewWidth] = useState(0);

  
  // Ref for the preview pane to measure its width
  const previewPaneRef = useRef<HTMLDivElement>(null);
  
  
  // Update the preview when code changes
  useEffect(() => {
    try {
      const parsedData = JSON.parse(code);
      setUserData(parsedData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  }, [code]);
  
  // Check preview pane width to determine layout
  useEffect(() => {
    // Function to check width and update state
    const checkWidth = () => {
      if (previewPaneRef.current) {
        setPreviewWidth(previewPaneRef.current.offsetWidth);
      }
    };
    
    // Initial check
    checkWidth();
    
    // Set up resize observer to check when pane is resized
    const resizeObserver = new ResizeObserver(checkWidth);
    
    // Store the current value of the ref
    const currentRef = previewPaneRef.current;
    
    if (currentRef) {
      resizeObserver.observe(currentRef);
    }
    
    // Clean up
    return () => {
      if (currentRef) {
        resizeObserver.unobserve(currentRef);
      }
      resizeObserver.disconnect();
    };
  }, []);
  
  // Define the components for the split pane
  const leftComponent = (
    <CodePane>
      <CodeEditor 
        value={code}
        onChange={setCode}
      />
    </CodePane>
  );
  
  const rightComponent = (
    <PreviewPane ref={previewPaneRef}>
      {error ? (
        <ErrorMessage>Error: {error}</ErrorMessage>
      ) : (
        <PreviewScroll>
          {/* Profile Card */}
          <ProfileCard>
            <Name>{userData.personOfInterest?.name || 'Name'}</Name>
            <Occupation>{userData.personOfInterest?.occupation || 'Occupation'}</Occupation>
            <Location>{userData.personOfInterest?.location || 'Location'}</Location>
            
            <Divider />
            
            <InfoBlurb>"{userData.infoBlurb || 'Info'}"</InfoBlurb>
            
            <USPContainer>
              {(userData.USP || []).map((item, index) => (
                <USPItem key={index}>{item}</USPItem>
              ))}
            </USPContainer>
            
            <SocialLinks>
              {userData.socialMedia?.linkedIn && (
                <SocialLink href={userData.socialMedia.linkedIn} target="_blank" rel="noopener noreferrer">
                  in
                </SocialLink>
              )}
              {userData.socialMedia?.github && (
                <SocialLink href={userData.socialMedia.github} target="_blank" rel="noopener noreferrer">
                  gh
                </SocialLink>
              )}
            </SocialLinks>
          </ProfileCard>
          
          {/* Portfolio Projects Section */}
          {userData.portfolioProjects && userData.portfolioProjects.length > 0 && (
            <>
              <SectionTitle>Portfolio Projects</SectionTitle>
              <ProjectsContainer previewWidth={previewWidth}>
                {userData.portfolioProjects.map((project) => (
                  <PortfolioItem key={project.id} id={project.id}>
                    <ProjectCard href={project.url} target="_blank">
                      <ProjectImage hasImage={!!project.image}>
                        {project.image && <img src={project.image} alt={project.title} />}
                      </ProjectImage>
                    </ProjectCard>
                    <DescriptionWrapper>
                      <ProjectTitle>
                        <a href={project.url} target="_blank" rel="noopener noreferrer">
                          {project.title}
                        </a>
                      </ProjectTitle>
                      <ProjectDescription>{project.description}</ProjectDescription>
                    </DescriptionWrapper>
                  </PortfolioItem>
                ))}
              </ProjectsContainer>
            </>
          )}
        </PreviewScroll>
      )}
    </PreviewPane>
  );
  
  return (
    <Container>
      <TopBar>
        <Title>Anders Hofsten | Portfolio</Title>
      </TopBar>
      
      <TabContainer>
        <TabSection>
        </TabSection>
        <TabSection>
        </TabSection>
      </TabContainer>
      
      <ResizableSplitPane
        initialLeftWidth={50}
        minLeftWidth={20}
        minRightWidth={20}
        leftComponent={leftComponent}
        rightComponent={rightComponent}
      />
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #131417;
  color: #e6e6e6;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const TopBar = styled.header`
  background-color: #0e0e10;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: space-between;
`;

const Title = styled.h1`
  font-size: 16px;
  font-weight: bold;
  margin: 0;
`;

const TabContainer = styled.div`
  display: flex;
  height: 30px;
  background-color: #1e1f26;
`;

const TabSection = styled.div`
  width: 50%;
  display: flex;
`;

const CodePane = styled.div`
  width: 100%;
  height: 100%;
  background-color: #1d1e22;
  overflow: hidden;
`;

const PreviewPane = styled.div`
  width: 100%;
  height: 100%;
  background-color: #131417;
  padding: 20px;
  overflow: auto;
`;

const PreviewScroll = styled.div`
  max-width: 80%;
  margin: 0 auto;
`;

const ErrorMessage = styled.div`
  padding: 10px;
  margin: 20px;
  background-color: #44292b;
  color: #e15a60;
  border-radius: 4px;
  font-family: 'MonoLisa', 'Consolas', monospace;
  font-size: 13px;
`;

const ProfileCard = styled.div`
  background-color: #1e1f26;
  border-radius: 4px;
  padding: 30px;
  width: 100%;
  margin-bottom: 30px;
`;

const Name = styled.h2`
  font-size: 28px;
  margin: 0 0 10px 0;
  font-weight: bold;
`;

const Occupation = styled.div`
  font-size: 16px;
  color: #aaaaaa;
  margin-bottom: 5px;
`;

const Location = styled.div`
  font-size: 14px;
  color: #777777;
  margin-bottom: 20px;
`;

const Divider = styled.div`
  height: 1px;
  background-color: #2e2f36;
  margin: 20px 0;
`;

const InfoBlurb = styled.div`
  font-size: 14px;
  color: #aaaaaa;
  margin-bottom: 30px;
  font-style: italic;
`;

const USPContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 30px;
`;

const USPItem = styled.div`
  background-color: #2e2f36;
  padding: 8px 10px;
  border-radius: 2px;
  font-size: 12px;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: #2e2f36;
  color: #ffffff;
  text-decoration: none;
  border-radius: 4px;
  font-size: 14px;
  
  &:hover {
    background-color: #3e3f46;
  }
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  margin: 20px 0;
  font-weight: 600;
  color: #ffffff;
`;

// Portfolio Project Styled Components
interface ProjectsContainerProps {
  previewWidth: number; 
}


const ProjectsContainer = styled.div<ProjectsContainerProps>`
  display: grid;
  grid-template-columns: ${props => {
    // 3 columns for very wide previews
    if (props.previewWidth >= 1400) return 'repeat(3, 1fr)';
    // 2 columns for medium width previews
    if (props.previewWidth >= 900) return 'repeat(2, 1fr)';
    // 1 column for narrow previews
    return '1fr';
  }};
  gap: 20px;
`;

const PortfolioItem = styled.div`
  background-color: #1e1f26;
  border-radius: 4px;
  overflow: hidden;
`;

const ProjectCard = styled.a`
  display: block;
  text-decoration: none;
  color: inherit;
  
  &:hover img {
    transform: scale(1.03);
  }
`;

const ProjectImage = styled.div<{ hasImage?: boolean }>`
  height: 380px;
  background-color: #24252c;
  padding: 10px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.3s ease;
  }
  
  /* If no image is available, show a placeholder */
  ${props => !props.hasImage && `
    display: flex;
    align-items: center;
    justify-content: center;
    
    &::after {
      content: 'Image';
      color: #555;
      font-size: 14px;
    }
  `}
`;

const DescriptionWrapper = styled.div`
  padding: 15px;
`;

const ProjectTitle = styled.div`
  margin-bottom: 10px;
  
  a {
    color: #61afef;
    text-decoration: none;
    font-weight: 600;
    font-size: 16px;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ProjectDescription = styled.p`
  font-size: 14px;
  color: #aaaaaa;
  line-height: 1.5;
  margin: 0;
`;

export default CodePenPortfolioLayout;