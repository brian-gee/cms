import { createSignal, onMount } from "solid-js";
import { confetti } from "canvas-confetti";

function LinkCard(props) {
  let confettiAnchor;

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  onMount(() => {
    confettiAnchor.addEventListener("click", triggerConfetti);
  });

  return (
    <li class="list-none flex p-0.5 bg-[#23262d] rounded-lg transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]">
      <a
        ref={confettiAnchor}
        class="w-full no-underline text-white bg-[#23262d] opacity-80 rounded-lg p-[calc(1.5rem-1px)] cursor-pointer"
      >
        <h2 class="m-0 text-1.25rem transition-colors duration-600 ease-[cubic-bezier(0.22,1,0.36,1)]">
          {props.title}
          <span>&rarr;</span>
        </h2>
        <p class="mt-2 mb-0">{props.body}</p>
      </a>
    </li>
  );
}

export default LinkCard;
