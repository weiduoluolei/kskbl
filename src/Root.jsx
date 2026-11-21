import { Composition } from "remotion";
import { Sequence, Text, AbsoluteFill } from "remotion";

export const MyComp = () => {
  return (
    <AbsoluteFill style={{backgroundColor:"#0f172a"}}>
      <Sequence from={0} durationInFrames={90}>
        <Text style={{fontSize:60,color:"white",textAlign:"center",top:120}}>人类发展史</Text>
        <Text style={{fontSize:32,color:"#cbd5e1",textAlign:"center",top:220}}>约300万年前 · 南方古猿</Text>
      </Sequence>
      <Sequence from={90} durationInFrames={90}>
        <Text style={{fontSize:40,color:"white",textAlign:"center",top:120}}>能人、直立人</Text>
        <Text style={{fontSize:32,color:"#cbd5e1",textAlign:"center",top:220}}>学会使用石器、火</Text>
      </Sequence>
      <Sequence from={180} durationInFrames={90}>
        <Text style={{fontSize:40,color:"white",textAlign:"center",top:120}}>尼安德特人</Text>
        <Text style={{fontSize:32,color:"#cbd5e1",textAlign:"center",top:220}}>早期智人，遍布欧亚</Text>
      </Sequence>
      <Sequence from={270} durationInFrames={90}>
        <Text style={{fontSize:40,color:"white",textAlign:"center",top:120}}>晚期智人</Text>
        <Text style={{fontSize:32,color:"#cbd5e1",textAlign:"center",top:220}}>现代人类，走向全世界</Text>
      </Sequence>
    </AbsoluteFill>
  );
};

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComp}
        durationInFrames={360}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
