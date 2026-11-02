import { useTheme } from "../context/ThemeContext";
import hangingWeb from "./images/hanging-web.png";
import manyBats from "./images/many-bats.png";
import pumpkinStack from "./images/pumkin-stack.png";
import spiderWeb from "./images/spider-web.png";

export default function HalloweenDecorations() {
  const { halloweenEnabled, halloweenThemeLoading } = useTheme();
  if (halloweenThemeLoading || !halloweenEnabled) return null;

  return (
    <div className="halloween-decorations" aria-hidden="true">
      <img className="halloween-hanging-web" src={hangingWeb} alt="" />
      <img className="halloween-spider-web" src={spiderWeb} alt="" />
      <img className="halloween-bat-cloud" src={manyBats} alt="" />
      <img className="halloween-pumpkin-stack" src={pumpkinStack} alt="" />
    </div>
  );
}
