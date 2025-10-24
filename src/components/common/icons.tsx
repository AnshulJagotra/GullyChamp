import type { SVGProps } from 'react';
import { Swords, History, BarChart3, Plus, Minus, Trash2, Dices, Users, Shirt, Target } from 'lucide-react';

export const Icons = {
  newMatch: Swords,
  history: History,
  stats: BarChart3,
  add: Plus,
  remove: Minus,
  delete: Trash2,
  cricket: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14.34 14.34C13.26 15.42 11.76 16 10 16s-3.26-.58-4.34-1.66" />
      <path d="M12 16v-4" />
      <path d="M12 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
      <path d="m15.66 15.66 3.53-3.53a2.12 2.12 0 0 0-3-3l-3.53 3.53" />
      <path d="M16.5 22h-9" />
      <path d="M12 22v-6" />
    </svg>
  ),
};
