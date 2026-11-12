"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is Stak?",
    answer:
      "Stak is a research and content creation platform that brings multi-agent research, article generation, LLM tracking, and brand interpretation together in one flat $129/month plan.",
  },
  {
    question: "What can I create with Stak?",
    answer:
      "You can create long-form articles, conduct multi-agent brainstorms and research briefs, track how language models interpret your brand, and manage work across 20 distinct projects.",
  },
  {
    question: "How does Stak's multi-agent research work?",
    answer:
      "Stak coordinates specialized agents in parallel to analyze your target keywords, brainstorm angles, evaluate competitor coverage, and synthesize insights before drafting begins.",
  },
  {
    question: "How does Stak help with content creation?",
    answer:
      "Stak uses research outputs and your company context to produce comprehensive article drafts aligned with your brand voice, with full human-in-the-loop review.",
  },
  {
    question: "What does LLM Tracking do?",
    answer:
      "LLM Tracking monitors how major language models answer category, competitor, and brand queries to observe how your company is cited and represented across AI platforms.",
  },
  {
    question: "What is Brand Interpretation?",
    answer:
      "Brand Interpretation analyzes how AI models describe your company, including your core positioning, product capabilities, and market categorization.",
  },
  {
    question: "How many projects can I create?",
    answer:
      "Stak includes up to 20 projects, allowing you to organize different brands, clients, or content initiatives in dedicated workspaces.",
  },
  {
    question: "How many articles can I create each month?",
    answer:
      "Every subscription includes up to 250 articles per month.",
  },
  {
    question: "How many keywords can I research?",
    answer:
      "You can research and track up to 100 keywords per month within your plan.",
  },
  {
    question: "How does Stak compare with Gehirn.md?",
    answer:
      "Stak provides the core capabilities of Gehirn.md—content creation, multi-agent research, LLM tracking, and brand interpretation—in one flat $129/month plan rather than four separate pricing tiers.",
  },
  {
    question: "Who is Stak for?",
    answer:
      "Stak is built for marketing teams, content leads, founders, and agencies that need research-backed content production, 20 projects, 250 articles per month, and LLM tracking in one subscription.",
  },
  {
    question: "How much does Stak cost?",
    answer:
      "Stak costs $129 per month. All core features—250 articles/month, 20 projects, 100 keywords, multi-agent research, LLM tracking, and brand interpretation—are included in that single plan.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col">
      <div className="-mx-6 h-px bg-stone-200/80" />
      <section
        id="faq"
        aria-labelledby="landing-faq-heading"
        className="py-14 sm:py-18"
      >
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          {/* Left Column: Eyebrow + Large Serif Heading */}
          <div className="md:col-span-5">
            <div className="md:sticky md:top-24">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-500 font-medium">
                FAQ
              </p>
              <h2
                id="landing-faq-heading"
                className="mt-3 font-serif text-3xl sm:text-4xl font-normal leading-[1.15] tracking-[-0.015em] text-[#14181f]"
              >
                Common questions.
              </h2>
            </div>
          </div>

          {/* Right Column: Editorial Accordion Stack */}
          <div className="md:col-span-7">
            <div className="divide-y divide-stone-200/80 border-y border-stone-200/80">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <div key={item.question} className="transition-colors">
                    <button
                      type="button"
                      id={`faq-question-${index}`}
                      onClick={() => toggle(index)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                      className="group flex w-full items-start justify-between gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
                    >
                      <span className="text-[15px] sm:text-[16px] font-medium text-[#14181f] leading-snug tracking-[-0.01em] transition-colors group-hover:text-stone-900 pr-2">
                        {item.question}
                      </span>
                      <span className="relative mt-1 flex h-4 w-4 shrink-0 items-center justify-center text-stone-400 transition-colors group-hover:text-stone-700">
                        <span
                          className={`absolute h-3.5 w-[1.5px] bg-current transition-transform duration-200 ease-out ${
                            isOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
                          }`}
                        />
                        <span className="h-[1.5px] w-3.5 bg-current" />
                      </span>
                    </button>
                    <div
                      id={`faq-answer-${index}`}
                      role="region"
                      aria-labelledby={`faq-question-${index}`}
                      className={`grid transition-[grid-template-rows] duration-250 ease-out ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="pb-5 pt-1 text-[13px] sm:text-[14px] leading-relaxed text-stone-600 font-light">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
