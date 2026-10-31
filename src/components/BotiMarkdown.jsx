import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Estilos para el tema oscuro. skipHtml descarta cualquier HTML crudo del texto.
const components = {
  p: (props) => <p className="my-2 first:mt-0 last:mb-0" {...props} />,
  strong: (props) => <strong className="font-semibold text-white" {...props} />,
  em: (props) => <em className="italic text-slate-200" {...props} />,
  h1: (props) => <h3 className="mb-2 mt-3 text-base font-bold text-white first:mt-0" {...props} />,
  h2: (props) => <h3 className="mb-2 mt-3 text-[15px] font-bold text-white first:mt-0" {...props} />,
  h3: (props) => <h4 className="mb-1.5 mt-3 text-sm font-semibold text-brand-pale first:mt-0" {...props} />,
  h4: (props) => <h4 className="mb-1 mt-2 text-sm font-semibold text-slate-100 first:mt-0" {...props} />,
  ul: (props) => <ul className="my-2 list-disc space-y-1 pl-5 marker:text-brand-light" {...props} />,
  ol: (props) => <ol className="my-2 list-decimal space-y-1 pl-5 marker:text-brand-pale" {...props} />,
  li: (props) => <li className="pl-0.5" {...props} />,
  a: (props) => <a className="font-medium text-brand-pale underline underline-offset-2 hover:text-white" target="_blank" rel="noopener noreferrer" {...props} />,
  blockquote: (props) => <blockquote className="my-2 border-l-2 border-brand-light/60 pl-3 text-slate-300" {...props} />,
  hr: () => <hr className="my-3 border-slate-700" />,
  code: ({ className, children, ...props }) =>
    className ? (
      <code className={`${className} block`} {...props}>{children}</code>
    ) : (
      <code className="rounded bg-slate-950/70 px-1.5 py-0.5 font-mono text-[0.85em] text-brand-pale" {...props}>{children}</code>
    ),
  pre: (props) => <pre className="my-2 overflow-x-auto rounded-xl bg-slate-950/80 p-3 font-mono text-xs text-slate-200" {...props} />,
  table: (props) => (
    <div className="my-2 overflow-x-auto rounded-xl border border-slate-700">
      <table className="w-full border-collapse text-left text-xs" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-slate-800/80 text-slate-200" {...props} />,
  th: (props) => <th className="whitespace-nowrap border-b border-slate-700 px-3 py-2 font-semibold" {...props} />,
  td: (props) => <td className="border-b border-slate-800 px-3 py-2 text-slate-300" {...props} />,
  tr: (props) => <tr className="[&:last-child>td]:border-b-0" {...props} />,
}

export default function BotiMarkdown({ children }) {
  return (
    <div className="boti-md break-words text-sm leading-relaxed text-slate-200">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
        {children}
      </ReactMarkdown>
    </div>
  )
}
