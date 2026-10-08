export function flightKeyframes(source, target) {
  const dx = source.left + source.width / 2 - target.left - target.width / 2;
  const dy = source.top + source.height / 2 - target.top - target.height / 2;
  const scale = source.width / target.width;
  const tilt = dx < 0 ? -10 : 10;
  return [
    {
      offset: 0,
      transform: `translate(${dx}px,${dy}px) rotate(0deg) scale(${scale})`,
      boxShadow: "0 3px 7px #0003",
    },
    {
      offset: 0.42,
      transform: `translate(${dx * 0.55}px,${dy * 0.55 - 45}px) rotate(${tilt}deg) scale(1.1)`,
      boxShadow: "0 18px 28px #0005",
    },
    {
      offset: 0.86,
      transform: "translate(0,-5px) rotate(-2deg) scale(1.025)",
      boxShadow: "0 5px 9px #0003",
    },
    {
      offset: 1,
      transform: "translate(0,0) rotate(0deg) scale(1)",
      boxShadow: "0 2px 5px #0002",
    },
  ];
}
