'use client';

import React from 'react';
import clsx from 'clsx';

type Props = {
  title: string;
  colourName: string;
  selectedColour?: (colour: string) => void;
};

export const TagComponent = ({ title, colourName, selectedColour }: Props) => {
  return (
    <div
      className={clsx('p-2 rounded-sm flex-shrink-0 text-xs cursor-pointer', {
        'bg-[#57acea]/10 text-[#57acea]': colourName === 'BLUE',
        'bg-[#ffac7e]/10 text-[#ffac7e]': colourName === 'ORANGE',
        'bg-rose-500/10 text-rose-500': colourName === 'ROSE',
        'bg-emerald-400/10 text-emerald-400': colourName === 'GREEN',
        'bg-purple-400/10 text-purple-400': colourName === 'PURPLE',
        'border-[1px] border-[#57acea]': colourName === 'BLUE' && !title,
        'border-[1px] border-[#ffac7e]': colourName === 'ORANGE' && !title,
        'border-[1px] border-rose-500': colourName === 'ROSE' && !title,
        'border-[1px] border-emerald-400': colourName === 'GREEN' && !title,
        'border-[1px] border-purple-400': colourName === 'PURPLE' && !title,
      })}
      key={colourName}
      onClick={() => {
        if (selectedColour) selectedColour(colourName);
      }}
    >
      {title}
    </div>
  );
};
