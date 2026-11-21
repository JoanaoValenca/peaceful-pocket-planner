# Gestao de Potes

# PROMPT — CRIAÇÃO DA INTERFACE E PROTÓTIPO UI/UX
## Sistema de Gestão Financeira Pessoal

Quero que você atue como um **Product Designer Sênior, especialista em UI/UX e design de produtos SaaS**, responsável por projetar e desenvolver a interface visual completa de um sistema de gestão financeira pessoal.

Sua responsabilidade nesta etapa é exclusivamente a experiência do usuário, a arquitetura de informação, o design visual e a construção de um protótipo navegável e interativo.

**IMPORTANTE: não implemente banco de dados, backend, autenticação real ou regras de negócio nesta etapa.** A implementação técnica e financeira será realizada posteriormente em outro ambiente de desenvolvimento, utilizando este projeto como referência visual e estrutural.

O PRD fornecido é a principal fonte de requisitos funcionais e deve orientar todas as decisões de interface.

---

# 1. OBJETIVO DO PRODUTO

O sistema será uma ferramenta de gestão financeira pessoal que permitirá ao usuário acompanhar sua vida financeira de maneira organizada, visual e consciente.

O objetivo é oferecer clareza sobre:

- Quanto dinheiro existe efetivamente nas contas bancárias.
- Quanto está disponível para gastar.
- Quanto foi separado para cada finalidade de consumo.
- Quanto foi efetivamente gasto em cada categoria.
- Quanto está reservado e protegido.
- Quais despesas e compromissos financeiros estão previstos para os próximos meses.
- Como os gastos se dividem entre necessidades e compras por impulso.
- Como está a evolução financeira ao longo do tempo.

A experiência deve transmitir organização, controle e tranquilidade, sem transformar a gestão financeira em uma atividade complicada.

O sistema não deve parecer uma planilha financeira tradicional nem um aplicativo bancário convencional.

Queremos um produto moderno, intuitivo, visualmente agradável e funcional.

# 2. ESCOPO DESTA ETAPA

Desenvolva a interface de todas as áreas previstas no PRD, com navegação funcional e dados fictícios para demonstrar os recursos.

O resultado deve ser um protótipo navegável, no qual seja possível clicar, abrir telas, acessar menus, preencher formulários, alternar períodos, visualizar gráficos e experimentar os principais fluxos.

Utilize dados fictícios consistentes entre as telas para que a experiência pareça a de um sistema real.

Os dados podem ser mantidos temporariamente no estado local da aplicação, apenas para simulação.

**Não implemente:**
- Supabase ou qualquer outro banco de dados.
- Estrutura de tabelas ou migrations.
- Autenticação real.
- Integrações bancárias ou APIs externas.
- Regras financeiras definitivas.
- Operações financeiras reais.
- Persistência de dados no backend.
- Processamento real de pagamentos.

Os valores apresentados nos gráficos, indicadores e saldos são demonstrativos.

Não crie uma arquitetura técnica que dificulte a implementação posterior do backend. Mantenha os componentes organizados, reutilizáveis e independentes da camada de dados.

# 3. DIREÇÃO VISUAL

Quero uma interface sofisticada, minimalista e contemporânea.

A inspiração deve vir de produtos digitais financeiros premium, dashboards modernos e aplicativos de produtividade bem resolvidos.

Evite a aparência de:
- Planilhas financeiras.
- Sistemas administrativos antigos.
- Aplicativos bancários excessivamente coloridos.
- Dashboards corporativos carregados de informações.
- Templates genéricos de administração.

## Características visuais desejadas

- Layout limpo e organizado.
- Hierarquia visual muito clara.
- Espaçamento generoso.
- Tipografia moderna e de excelente legibilidade.
- Bordas discretas e cantos levemente arredondados.
- Cards elegantes, sem excesso de sombras.
- Ícones simples e consistentes.
- Gráficos minimalistas.
- Uso equilibrado de cores.
- Animações discretas e funcionais.
- Excelente contraste e acessibilidade.

## Paleta de cores

Utilize uma identidade visual baseada em tons neutros e naturais.

Sugestão inicial:

- Fundo principal: off-white ou cinza muito claro.
- Superfícies e cards: branco.
- Texto principal: grafite ou quase preto.
- Texto secundário: cinza médio.
- Cor principal: verde escuro ou verde oliva sofisticado.
- Cor complementar: bege ou areia.
- Sucesso: verde.
- Atenção: âmbar discreto.
- Erro: vermelho moderado.

Não utilize cores saturadas em excesso.

As cores devem ter função informativa, e não apenas decorativa.

O verde deve representar estabilidade e saúde financeira, mas não precisa dominar toda a interface.

# 4. ESTRUTURA PRINCIPAL E NAVEGAÇÃO

Crie uma estrutura de navegação consistente.

No desktop, prefira um menu lateral fixo ou expansível, com ícones e nomes das seções.

No celular, utilize uma navegação adaptada, que pode incluir menu inferior ou menu lateral recolhível, desde que seja intuitiva.

As seções principais serão:

1. Visão geral
2. Contas bancárias
3. Meus potes
4. Reservas financeiras
5. Movimentações
6. Despesas e compromissos
7. Planejamento mensal
8. Relatórios

Organize a navegação de maneira que as áreas relacionadas fiquem fáceis de encontrar.

A interface deve permitir acessar rapidamente as ações mais frequentes, especialmente adicionar receita, registrar despesa e distribuir dinheiro entre os potes.

# 5. TELAS E FUNCIONALIDADES VISUAIS

## 5.1. VISÃO GERAL — DASHBOARD

Esta será a tela inicial do sistema.

Deve apresentar uma visão clara da situação financeira atual, sem sobrecarregar o usuário.

Crie uma composição com os seguintes indicadores:

**Saldo total nas contas**

Representa a soma dos saldos bancários reais, considerando cada conta uma única vez.

**Dinheiro disponível para gastar**

Representa o dinheiro das contas de uso cotidiano, descontando valores protegidos em reservas virtuais.

**Dinheiro distribuído entre os potes**

Apresenta quanto está separado para as diferentes finalidades de consumo.

**Dinheiro não distribuído**

Mostra o valor disponível que ainda não foi destinado a nenhum pote.

**Reservas financeiras**

Apresenta o total protegido, com indicação de quanto está em reservas virtuais e quanto está em contas bancárias específicas de reserva.

**Compromissos futuros**

Apresenta o total de despesas fixas e parcelas ainda não pagas.

Esses indicadores devem ser visualmente distintos.

Atenção: potes e reservas não representam dinheiro adicional ao saldo bancário. A interface deve deixar clara essa relação e evitar qualquer apresentação que sugira soma duplicada.

Inclua também:

- Gráfico de receitas versus despesas no mês.
- Distribuição dos gastos por pote ou categoria.
- Comparativo entre necessidades e compras por impulso.
- Resumo dos próximos compromissos.
- Evolução do saldo financeiro.
- Atalhos para as ações mais frequentes.

Utilize tooltips ou pequenas explicações para esclarecer indicadores que possam gerar dúvidas.

## 5.2. CONTAS BANCÁRIAS

Tela para visualizar e organizar as contas financeiras.

Cada conta deve apresentar:

- Nome da instituição.
- Nome personalizado da conta.
- Tipo de conta.
- Saldo atual.
- Classificação: uso cotidiano ou reserva.
- Status.

Crie uma apresentação visual elegante, com cards ou lista organizada.

Inclua ações visuais para:

- Adicionar conta.
- Editar conta.
- Consultar movimentações.
- Ajustar saldo.
- Visualizar detalhes.

Crie um formulário de cadastro com campos adequados.

Inclua exemplos fictícios de contas correntes e contas de reserva.

## 5.3. MEUS POTEs

Esta é uma das áreas mais importantes do sistema.

O conceito de potes deve ser visualmente intuitivo.

Cada pote representa uma finalidade para a qual o usuário separa parte do dinheiro disponível, como:

- Alimentação.
- Transporte.
- Lazer.
- Saúde.
- Cuidados pessoais.
- Casa.
- Assinaturas.
- Educação.

Cada pote deve apresentar:

- Nome.
- Ícone.
- Cor.
- Valor reservado.
- Valor gasto.
- Saldo restante.
- Orçamento planejado.
- Percentual utilizado.

Diferencie visualmente orçamento planejado e dinheiro efetivamente reservado.

Exemplo:

Orçamento mensal: R$ 500,00.
Valor reservado: R$ 350,00.
Valor gasto: R$ 120,00.
Saldo reservado restante: R$ 230,00.

Não confunda orçamento com dinheiro disponível.

Inclua:

- Criar pote.
- Editar pote.
- Distribuir dinheiro.
- Transferir entre potes.
- Consultar histórico.
- Visualizar detalhes.
- Configurar periodicidade.
- Configurar regra de saldo restante ao final do período.

Crie uma visualização detalhada para cada pote.

### Distribuição de dinheiro

Crie um fluxo visual simples para distribuir dinheiro entre os potes.

O usuário deve conseguir visualizar:

- Valor disponível para distribuição.
- Potes existentes.
- Valor atualmente reservado em cada pote.
- Campo para informar quanto deseja destinar a cada um.
- Total distribuído.
- Valor ainda não distribuído.

O fluxo deve ser claro e evitar erros de preenchimento.

### Transferência entre potes

Crie um modal ou tela para selecionar:

- Pote de origem.
- Pote de destino.
- Valor.
- Observação opcional.

Apresente um resumo da operação antes da confirmação.

### Encerramento do período

Cada pote poderá ter uma regra individual para o dinheiro que sobrar no final do período:

- Acumular para o próximo período.
- Liberar para o dinheiro não distribuído.
- Decidir manualmente no encerramento.

Crie uma interface para demonstrar essa configuração.

## 5.4. RESERVAS FINANCEIRAS

Área destinada ao dinheiro que o usuário deseja proteger e não utilizar no consumo cotidiano.

Exemplos:

- Reserva de emergência.
- Viagens.
- Compra de bens.
- Objetivos pessoais.
- Outros objetivos financeiros.

Cada reserva deve apresentar:

- Nome.
- Objetivo financeiro.
- Valor acumulado.
- Meta.
- Percentual alcançado.
- Data desejada, quando aplicável.
- Localização do dinheiro: reserva virtual ou conta bancária específica.

Utilize barras de progresso e elementos visuais discretos.

Inclua ações para:

- Criar reserva.
- Editar reserva.
- Adicionar valor.
- Retirar valor.
- Consultar histórico.
- Visualizar progresso.

Deixe visualmente clara a diferença entre uma reserva virtual, que representa dinheiro protegido dentro de uma conta de uso cotidiano, e uma reserva mantida em uma conta bancária separada.

## 5.5. MOVIMENTAÇÕES

Crie uma área centralizada para consultar receitas, despesas, transferências e demais movimentações.

A tela deve apresentar uma tabela ou lista organizada, com:

- Data.
- Descrição.
- Tipo de movimentação.
- Conta.
- Pote ou categoria.
- Valor.
- Classificação, quando aplicável.

Utilize cores e sinais visuais discretos para diferenciar entradas e saídas.

Inclua filtros por:

- Período.
- Conta.
- Pote.
- Categoria.
- Tipo de movimentação.
- Necessidade ou impulso.

Inclua campo de busca.

Crie um botão de destaque para registrar movimentação.

### Formulário de movimentação

O formulário deve se adaptar ao tipo selecionado.

Tipos disponíveis:

- Receita.
- Despesa.
- Transferência entre contas.
- Distribuição de dinheiro.
- Transferência entre potes.
- Depósito em reserva.
- Retirada de reserva.
- Ajuste de saldo.

Para receitas, apresente:

- Descrição.
- Valor.
- Data.
- Conta de destino.
- Categoria opcional.
- Observação.

Para despesas, apresente:

- Descrição.
- Valor.
- Data.
- Conta de origem.
- Pote ou categoria.
- Classificação obrigatória: necessidade ou impulso.
- Observação.

Para transferências entre contas, apresente conta de origem, conta de destino, valor e data.

Os demais tipos devem apresentar campos compatíveis com sua finalidade.

Utilize formulários simples, com boa organização e sem excesso de campos simultâneos.

## 5.6. DESPESAS E COMPROMISSOS

Crie uma área para acompanhar despesas fixas e compras parceladas.

Organize em duas abas:

- Despesas fixas.
- Compras parceladas.

### Despesas fixas

Cada despesa deve apresentar:

- Nome.
- Valor previsto.
- Categoria.
- Pote associado, quando aplicável.
- Classificação: necessidade ou impulso.
- Frequência.
- Próximo vencimento.
- Status.

Crie indicadores para:

- Total previsto no mês.
- Total já pago.
- Total pendente.
- Total em atraso.

Inclua ações para:

- Cadastrar despesa recorrente.
- Editar configuração.
- Consultar ocorrências.
- Marcar como paga.
- Cancelar ocorrência.
- Consultar histórico.

Ao clicar em marcar como paga, abra uma confirmação com:

- Valor efetivamente pago.
- Conta utilizada.
- Data do pagamento.
- Pote relacionado, quando aplicável.

### Compras parceladas

Cada compra deve apresentar:

- Descrição.
- Valor total.
- Quantidade de parcelas.
- Valor da parcela.
- Data da compra.
- Primeira data de vencimento.
- Parcelas pagas.
- Parcelas pendentes.
- Progresso do pagamento.

Crie uma tela de detalhes com uma linha do tempo ou lista de parcelas.

Cada parcela deve apresentar:

- Número.
- Valor.
- Vencimento.
- Status.
- Data do pagamento, quando aplicável.

Inclua ações visuais para:

- Cadastrar compra parcelada.
- Consultar parcelas.
- Marcar parcela como paga.
- Editar parcelas futuras.
- Antecipar quitação.
- Cancelar compromisso.

Não crie funcionalidades de cartão de crédito. O sistema acompanha compromissos parcelados registrados manualmente, independentemente de como foram contratados.

## 5.7. PLANEJAMENTO MENSAL

Esta área deve permitir ao usuário visualizar e planejar sua situação financeira em determinado mês.

Crie uma interface com seletor de mês e ano.

Apresente:

- Receitas previstas.
- Receitas recebidas.
- Despesas fixas previstas.
- Despesas fixas pagas.
- Parcelas previstas.
- Parcelas pagas.
- Orçamentos dos potes.
- Valores efetivamente distribuídos.
- Despesas extraordinárias previstas.
- Resultado projetado.

Diferencie claramente valores previstos e valores efetivamente realizados.

Inclua uma visualização cronológica dos compromissos do mês.

Crie uma composição visual que ajude o usuário a entender como o dinheiro deve se comportar ao longo do mês.

Não apresente orçamento dos potes como se fosse despesa efetivamente paga.

## 5.8. RELATÓRIOS

Crie uma área de análise financeira com gráficos e filtros.

Organize os relatórios em categorias ou abas.

### Visão geral

- Receitas.
- Despesas.
- Evolução do saldo.
- Comparativo mensal.
- Distribuição dos gastos.

### Análise por potes

- Orçamento planejado.
- Valor reservado.
- Valor gasto.
- Saldo restante.
- Histórico de utilização.
- Comparação entre períodos.

### Necessidade versus impulso

Este relatório é um dos diferenciais do produto.

Apresente:

- Total gasto com necessidades.
- Total gasto por impulso.
- Percentual de cada grupo.
- Evolução mensal.
- Comparativo entre períodos.
- Distribuição por pote.

A interface deve transmitir neutralidade. Não utilize mensagens moralistas, julgamentos ou alertas que constranjam o usuário.

O objetivo é oferecer consciência sobre o comportamento financeiro, não classificar o usuário como certo ou errado.

Inclua filtros por período e demais dimensões relevantes.

# 6. EXPERIÊNCIA DE USO E INTERAÇÕES

Não quero telas estáticas.

O protótipo deve permitir experimentar os principais fluxos.

Implemente interações simuladas para:

- Navegar entre todas as seções.
- Abrir e fechar modais.
- Cadastrar itens com dados fictícios.
- Editar informações temporariamente.
- Alternar meses e períodos.
- Aplicar filtros visuais.
- Abrir detalhes de contas, potes e despesas.
- Alternar abas.
- Visualizar confirmações.
- Exibir mensagens de sucesso e erro.
- Demonstrar estados vazios.

Quando o usuário realizar uma ação, apresente uma resposta visual coerente.

Os dados podem ser atualizados temporariamente durante a navegação para tornar o protótipo mais realista.

Entretanto, não simule operações financeiras complexas como se já fossem regras definitivas. A lógica real será implementada posteriormente.

# 7. RESPONSIVIDADE

A interface deve ser pensada para desktop e dispositivos móveis desde o início.

No desktop:
- Aproveite o espaço horizontal.
- Utilize tabelas quando fizer sentido.
- Mantenha indicadores e gráficos bem distribuídos.
- Preserve hierarquia visual.

No celular:
- Priorize as informações essenciais.
- Transforme tabelas em listas ou cards quando necessário.
- Utilize formulários confortáveis para preenchimento.
- Evite elementos muito pequenos.
- Facilite ações frequentes com uma mão.
- Garanta que menus e modais funcionem adequadamente.

Não quero apenas uma versão desktop reduzida para celular. A experiência mobile deve ser planejada de maneira própria.

# 8. MICROINTERAÇÕES E ANIMAÇÕES

Utilize animações sutis para tornar a experiência mais agradável.

Exemplos:

- Transições suaves entre telas.
- Feedback visual ao selecionar menus.
- Animação discreta de abertura de modais.
- Barras de progresso animadas.
- Pequenas transições em gráficos.
- Feedback ao concluir ações.
- Estados de hover e foco bem definidos.

Evite animações exageradas, efeitos chamativos ou transições demoradas.

O produto deve parecer refinado, não infantil ou excessivamente tecnológico.

# 9. ORGANIZAÇÃO DO CÓDIGO

Embora esta etapa seja focada em UI/UX, a estrutura criada deverá facilitar a implementação posterior.

Portanto:

- Crie componentes reutilizáveis.
- Mantenha uma organização consistente de pastas.
- Separe componentes visuais de páginas.
- Evite duplicação desnecessária.
- Mantenha formulários organizados.
- Utilize dados fictícios centralizados sempre que possível.
- Evite acoplamento desnecessário entre componentes.
- Não espalhe valores demonstrativos diretamente por toda a aplicação.
- Não misture a apresentação visual com regras financeiras complexas.

A implementação posterior será realizada com Cursor, que deverá conseguir compreender, revisar e evoluir o código existente.

Não faça refatorações desnecessárias apenas para utilizar uma arquitetura sofisticada.

# 10. ORIENTAÇÕES DE EXECUÇÃO

Não tente construir tudo de maneira apressada e superficial.

Antes de implementar, analise o PRD e organize a arquitetura das telas.

Priorize a consistência visual entre todas as áreas.

Não elimine funcionalidades previstas no documento por considerar que exigiriam implementação complexa.

Quando houver dúvidas sobre como representar uma funcionalidade visualmente, escolha a solução mais intuitiva e coerente com o objetivo do produto.

Não invente novos módulos que alterem o escopo do produto.

Utilize português brasileiro em toda a interface.

Utilize o formato monetário brasileiro (R$ 1.234,56) e datas no padrão DD/MM/AAAA.

Os dados fictícios devem ser realistas e coerentes entre as telas.

# 11. RESULTADO ESPERADO

Ao final desta etapa, quero ter:

1. Uma aplicação visualmente completa.
2. Todas as seções principais implementadas.
3. Navegação funcional.
4. Formulários e modais interativos.
5. Gráficos e indicadores demonstrativos.
6. Fluxos principais simulados.
7. Layout responsivo.
8. Componentes visuais reutilizáveis.
9. Código organizado para receber posteriormente a implementação técnica.

**Não considere o trabalho concluído apenas porque todas as páginas foram criadas. O objetivo é entregar uma experiência de produto coerente, intuitiva e suficientemente madura para ser avaliada antes da implementação do backend.**

O PRD é a referência funcional. Este prompt define o limite de atuação nesta etapa: design, interface e protótipo navegável. Não implemente o backend ou as regras financeiras reais.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5e1bca32-fdc4-467b-9c4b-c7cee0f2894c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
