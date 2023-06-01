import React, { MouseEventHandler, ReactElement, useState } from 'react';

type AccordionProps = {
    children: ReactElement[];
};

type AccordionItemProps = {
    title: string;
    children: ReactElement;
    isActive?: boolean;
    onToggle?: MouseEventHandler<HTMLButtonElement>;
};

export const AccordionItem = ({ title, isActive, onToggle, children }: AccordionItemProps) => (
    <div className={`accordion-item ${isActive ? 'active' : ''}`} >
        <h2 className="accordion-header">
            <button
                className="accordion-button"
                onClick={onToggle}
                type="button"
            >
                {title}
            </button>
        </h2>
        <div className="accordion-collapse" style={isActive ? { display: 'block' } : {display: 'none'}}>
            <div className="accordion-body">
                {children}
            </div>
        </div>
    </div>
)

export const Accordion = ({ children }: AccordionProps) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const handleToggle = (e: React.MouseEvent<HTMLButtonElement>, index: number | null) => {        
        setActiveIndex(index === activeIndex ? null : index);
        setTimeout(() => {
            if (index !== null) {
                const domElement = e.target as HTMLButtonElement;
                domElement?.scrollIntoView({ behavior: 'smooth' });
            }
        }, 250);
    };

    return (
        <div className="accordion">
            {React.Children.map(children, (child: React.ReactElement, index: number) =>
                React.cloneElement(child, {
                    isActive: index === activeIndex,
                    onToggle: (e: React.MouseEvent<HTMLButtonElement>) => handleToggle(e, index),
                })
            )}
        </div>
    );
};