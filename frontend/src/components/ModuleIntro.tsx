import '../styles/ModuleIntro.css';

interface ModuleIntroProps {
	title: string;
	description: string;
	count?: string;
}

export default function ModuleIntro({ title, description, count }: ModuleIntroProps) {
	return (
		<div className="rd-module-intro">
			<div className="rd-module-intro-copy">
				<h3>{title}</h3>
				<p>{description}</p>
			</div>
			{count && <div className="rd-module-intro-count">{count}</div>}
		</div>
	);
}
