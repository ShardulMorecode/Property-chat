'use client';

import styled from 'styled-components';
import { Send, Home, Sparkles, MapPin, Bed, Calendar, Maximize2, Building2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// Styled Components
const Container = styled.div`
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
`;

const Sidebar = styled.div`
  width: 280px;
  background: white;
  border-right: 1px solid #e2e8f0;
  box-shadow: 2px 0 20px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
`;

const LogoIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
  animation: pulse 3s infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
`;

const LogoText = styled.h1`
  font-size: 24px;
  font-weight: 900;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const NewSearchBtn = styled.button`
  width: calc(100% - 48px);
  margin: 24px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
  transition: all 0.3s;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 15px 40px rgba(59, 130, 246, 0.5);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const RecentSearches = styled.div`
  padding: 16px 24px;
  flex: 1;
  overflow-y: auto;
`;

const RecentTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
`;

const SearchItem = styled.div`
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  color: #334155;
  cursor: pointer;
  margin-bottom: 8px;
  transition: all 0.2s;

  &:hover {
    background: linear-gradient(90deg, #eff6ff, #f5f3ff);
    color: #3b82f6;
  }
`;

const UserProfile = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
`;

const ProfileCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
`;

const Header = styled.div`
  padding: 24px 32px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`;

const HeaderIcon = styled.div`
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
`;

const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
`;

const MessageContainer = styled.div<{ $isUser?: boolean }>`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  justify-content: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const MessageBubble = styled.div<{ $isUser?: boolean }>`
  max-width: 600px;
  padding: 20px 24px;
  border-radius: 24px;
  font-size: 15px;
  line-height: 1.6;
  ${props => props.$isUser ? `
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    color: white;
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
  ` : `
    background: white;
    color: #1e293b;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  `}
`;

const PropertyCard = styled.div`
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  padding: 24px;
  margin-top: 16px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 12px 40px rgba(59, 130, 246, 0.2);
    transform: translateY(-2px);
  }
`;

const PropertyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 16px;
`;

const PropertyTitle = styled.h3`
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PropertyLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 14px;
  margin-bottom: 4px;
`;

const PropertyPrice = styled.div`
  font-size: 28px;
  font-weight: 900;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const PropertyDetails = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const DetailBadge = styled.div<{ $color?: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  ${props => {
    const colors = {
      blue: 'background: linear-gradient(135deg, #3b82f6, #2563eb); color: white;',
      green: 'background: linear-gradient(135deg, #10b981, #059669); color: white;',
      purple: 'background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white;'
    };
    return colors[props.$color as keyof typeof colors] || colors.blue;
  }}
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const AmenityPill = styled.span`
  display: inline-block;
  padding: 6px 14px;
  background: linear-gradient(135deg, #eff6ff, #f5f3ff);
  color: #3b82f6;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 8px;
  margin-bottom: 8px;
  border: 1px solid #dbeafe;
`;

const ViewDetailsBtn = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  margin-top: 16px;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
  transition: all 0.3s;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 12px 32px rgba(59, 130, 246, 0.4);
  }
`;

const InputArea = styled.div`
  padding: 24px 32px;
  border-top: 1px solid #e2e8f0;
  background: white;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
`;

const InputBox = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(90deg, #f8fafc, #f3f4f6);
  border: 2px solid #e2e8f0;
  border-radius: 28px;
  padding: 12px 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: all 0.3s;

  &:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 4px 24px rgba(59, 130, 246, 0.2);
  }
`;

const Input = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;

  &::placeholder {
    color: #94a3b8;
  }
`;

const SendButton = styled.button`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
  transition: all 0.3s;

  &:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 12px 28px rgba(59, 130, 246, 0.5);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 6px;
  padding: 20px;

  div {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`;

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  properties?: Property[];
}

interface Property {
  project_id: string;
  project_name: string;
  bhk_type: string;
  price_min: number;
  price_max: number;
  carpet_area_min: number;
  carpet_area_max: number;
  address: string;
  landmark: string;
  pincode: string;
  status: string;
  bathrooms: number;
  balcony: number;
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your property assistant. I can help you find your dream home. Try asking me something like 'Show me 3BHK flats in Pune under ₹1.2 Cr' or 'Ready to move apartments in Baner'."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const recentSearches = [
    '3BHK in Pune under ₹1.2Cr',
    '2BHK near metro Baner',
    'Ready homes in Wakad',
    'Luxury flats Mumbai'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        properties: data.properties || []
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (min: number, max: number) => {
    const format = (price: number) => {
      if (price >= 100) return `₹${(price / 100).toFixed(2)} Cr`;
      return `₹${price.toFixed(1)} L`;
    };
    return max > min ? `${format(min)} - ${format(max)}` : format(min);
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Container>
      <Sidebar>
        <Logo>
          <LogoIcon>
            <Home size={24} color="white" />
          </LogoIcon>
          <LogoText>NoBrokerage</LogoText>
        </Logo>
        <NewSearchBtn onClick={() => {
          setMessages([{
            id: '1',
            role: 'assistant',
            content: "Hello! I'm your property assistant. How can I help you find your dream home today?"
          }]);
        }}>
          <Sparkles size={20} />
          New Search
        </NewSearchBtn>
        <RecentSearches>
          <RecentTitle>Recent Searches</RecentTitle>
          {recentSearches.map((search, idx) => (
            <SearchItem key={idx} onClick={() => setInput(search)}>
              {search}
            </SearchItem>
          ))}
        </RecentSearches>
        <UserProfile>
          <ProfileCard>
            <Avatar>U</Avatar>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>User</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>View Profile</div>
            </div>
          </ProfileCard>
        </UserProfile>
      </Sidebar>

      <MainArea>
        <Header>
          <HeaderIcon>
            <Sparkles size={28} color="white" />
          </HeaderIcon>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: 24, marginBottom: 4 }}>AI Property Assistant</h1>
            <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>Powered by advanced search algorithms</p>
          </div>
        </Header>

        <Messages>
          {messages.map((message) => (
            <MessageContainer key={message.id} $isUser={message.role === 'user'}>
              {message.role === 'assistant' && (
                <LogoIcon style={{ width: 40, height: 40, flexShrink: 0 }}>
                  <Sparkles size={20} color="white" />
                </LogoIcon>
              )}
              
              <div style={{ flex: 1, maxWidth: message.role === 'user' ? 600 : '100%' }}>
                <MessageBubble $isUser={message.role === 'user'}>
                  {message.content}
                </MessageBubble>

                {message.properties && message.properties.length > 0 && (
                  <div>
                    {message.properties.map((property) => (
                      <PropertyCard key={property.project_id}>
                        <PropertyHeader>
                          <div style={{ flex: 1 }}>
                            <PropertyTitle>
                              <Building2 size={24} color="#3b82f6" />
                              {property.project_name}
                            </PropertyTitle>
                            <PropertyLocation>
                              <MapPin size={16} />
                              {property.address.substring(0, 60)}...
                            </PropertyLocation>
                            {property.landmark && (
                              <div style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 600, marginTop: 4 }}>
                                Near {property.landmark}
                              </div>
                            )}
                          </div>
                          <PropertyPrice>
                            {formatPrice(property.price_min, property.price_max)}
                          </PropertyPrice>
                        </PropertyHeader>

                        <PropertyDetails>
                          <DetailBadge $color="blue">
                            <Bed size={16} />
                            {property.bhk_type}
                          </DetailBadge>
                          {property.carpet_area_min > 0 && (
                            <DetailBadge $color="green">
                              <Maximize2 size={16} />
                              {property.carpet_area_min}-{property.carpet_area_max} sq ft
                            </DetailBadge>
                          )}
                          <DetailBadge $color="purple">
                            <Calendar size={16} />
                            {formatStatus(property.status)}
                          </DetailBadge>
                        </PropertyDetails>

                        <div>
                          {property.bathrooms > 0 && (
                            <AmenityPill>{property.bathrooms} Bath</AmenityPill>
                          )}
                          {property.balcony > 0 && (
                            <AmenityPill>{property.balcony} Balcony</AmenityPill>
                          )}
                          {property.pincode && (
                            <AmenityPill>PIN: {property.pincode}</AmenityPill>
                          )}
                        </div>

                        <ViewDetailsBtn>View Details</ViewDetailsBtn>
                      </PropertyCard>
                    ))}
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <Avatar style={{ width: 40, height: 40, flexShrink: 0 }}>U</Avatar>
              )}
            </MessageContainer>
          ))}

          {loading && (
            <MessageContainer>
              <LogoIcon style={{ width: 40, height: 40, flexShrink: 0 }}>
                <Sparkles size={20} color="white" />
              </LogoIcon>
              <MessageBubble>
                <LoadingDots>
                  <div />
                  <div />
                  <div />
                </LoadingDots>
              </MessageBubble>
            </MessageContainer>
          )}

          <div ref={messagesEndRef} />
        </Messages>

        <InputArea>
          <InputBox>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me about properties... (e.g., 2BHK in Baner under 80L)"
              disabled={loading}
            />
            <SendButton onClick={handleSend} disabled={!input.trim() || loading}>
              <Send size={20} color="white" />
            </SendButton>
          </InputBox>
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#64748b', fontWeight: 600 }}>
            <Sparkles size={14} style={{ display: 'inline', marginRight: 6 }} />
            AI-powered property search • Results from verified listings only
          </div>
        </InputArea>
      </MainArea>
    </Container>
  );
}