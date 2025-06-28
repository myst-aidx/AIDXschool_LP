import React, { useEffect, useState } from 'react';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow-x: hidden;
`;

const Hero = styled.section`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const HeroContent = styled(motion.div)`
  text-align: center;
  z-index: 10;
  color: white;
`;

const Title = styled(motion.h1)`
  font-size: 4rem;
  margin-bottom: 1rem;
  font-weight: 900;
  text-shadow: 0 4px 20px rgba(0,0,0,0.3);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const RiveContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
`;

const InteractiveSection = styled.section`
  padding: 100px 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
`;

const FeatureTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const FeatureDescription = styled.p`
  font-size: 1.2rem;
  line-height: 1.8;
  opacity: 0.9;
`;

const RiveFeature = styled.div`
  width: 300px;
  height: 300px;
  margin: 0 auto;
  cursor: pointer;
`;

const CTAButton = styled(motion.button)`
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  padding: 20px 40px;
  font-size: 1.2rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 10px 30px rgba(240, 87, 108, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(240, 87, 108, 0.4);
  }
`;

const RiveLandingPage: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Riveアニメーションの設定（実際のファイルがない場合のフォールバック付き）
  const { RiveComponent: HeroRive, rive: heroRive } = useRive({
    src: '/animations/hero-animation.riv',
    stateMachines: 'State Machine 1',
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center,
    }),
    autoplay: true,
    onLoad: () => setIsLoaded(true),
  });

  const { RiveComponent: FeatureRive1 } = useRive({
    src: '/animations/feature1.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
  });

  const { RiveComponent: FeatureRive2 } = useRive({
    src: '/animations/feature2.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
  });

  const { RiveComponent: FeatureRive3 } = useRive({
    src: '/animations/feature3.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
  });

  return (
    <PageContainer>
      <Hero>
        <RiveContainer>
          {HeroRive && <HeroRive />}
        </RiveContainer>
        
        <HeroContent
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <Title>
            Rive Animation LP
          </Title>
          <Subtitle>
            プロフェッショナルなベクターアニメーションで
            <br />
            インタラクティブな体験を
          </Subtitle>
          <CTAButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            今すぐ体験する
          </CTAButton>
        </HeroContent>
      </Hero>

      <InteractiveSection>
        <Card
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <FeatureTitle>状態遷移アニメーション</FeatureTitle>
          <FeatureDescription>
            Riveなら、デザイナーが作った複雑なアニメーションの状態を
            コードから自在にコントロールできます。
            ホバー、クリック、ドラッグなど、あらゆるインタラクションに対応。
          </FeatureDescription>
          <RiveFeature>
            {FeatureRive1 && <FeatureRive1 />}
          </RiveFeature>
        </Card>

        <Card
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <FeatureTitle>軽量で高性能</FeatureTitle>
          <FeatureDescription>
            ベクターベースのアニメーションだから、
            どんな解像度でも美しく、ファイルサイズも最小限。
            60fpsのスムーズなアニメーションを実現します。
          </FeatureDescription>
          <RiveFeature>
            {FeatureRive2 && <FeatureRive2 />}
          </RiveFeature>
        </Card>

        <Card
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <FeatureTitle>リアルタイムレンダリング</FeatureTitle>
          <FeatureDescription>
            動画ではなくリアルタイムレンダリングだから、
            ユーザーの入力に即座に反応。
            ゲームのようなインタラクティブ体験を提供できます。
          </FeatureDescription>
          <RiveFeature>
            {FeatureRive3 && <FeatureRive3 />}
          </RiveFeature>
        </Card>
      </InteractiveSection>
    </PageContainer>
  );
};

export default RiveLandingPage;