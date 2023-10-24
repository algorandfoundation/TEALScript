import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Power of Algorand',
    description: (
      <>
        TEALScript gives developers direct access to the power of Algorand, a layer-1 blockchain with quick round times
        and instant finality.
      </>
    ),
  },
  {
    title: 'Native TypeScript',
    description: (
      <>
        All TEALScript code is just TypeScript, allowing you to focus on business logic and architecture instead of the
        smart contract langauge.
      </>
    ),
  },
  {
    title: 'Familiar Tooling',
    description: (
      <>
        Because TEALScript is TypeScript, IDEs like VSCode and familiar tool slike Prettier and ESLint are supported out
        of the box!
      </>
    ),
  },
];

function Feature({ title, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
