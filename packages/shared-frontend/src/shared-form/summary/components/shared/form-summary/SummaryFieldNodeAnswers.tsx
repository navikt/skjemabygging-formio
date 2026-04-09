import { Box, FormSummary, List } from '@navikt/ds-react';
import type { SharedFormSummaryFieldNode, SharedFormSummaryValue } from '@navikt/skjemadigitalisering-shared-form';

interface Props {
  node: SharedFormSummaryFieldNode;
}

const renderSummaryValue = (summaryValue: SharedFormSummaryValue) => {
  if (summaryValue.values && summaryValue.values.length > 0) {
    return (
      <FormSummary.Value>
        <Box marginBlock="space-16" asChild>
          <List data-aksel-migrated-v8 as="ul">
            {summaryValue.values.map((item) => (
              <List.Item key={String(item)}>{item}</List.Item>
            ))}
          </List>
        </Box>
      </FormSummary.Value>
    );
  }

  if (summaryValue.html) {
    return <div dangerouslySetInnerHTML={{ __html: summaryValue.html }} />;
  }

  return <FormSummary.Value>{summaryValue.value}</FormSummary.Value>;
};

const SummaryFieldNodeAnswers = ({ node }: Props) => {
  return (
    <>
      {node.values.map((summaryValue, index) => {
        const label = summaryValue.label ?? (index === 0 ? node.label : undefined);

        return (
          <FormSummary.Answer key={`${node.key ?? node.submissionPath}-${index}`}>
            {label && <FormSummary.Label>{label}</FormSummary.Label>}
            {renderSummaryValue(summaryValue)}
          </FormSummary.Answer>
        );
      })}
    </>
  );
};

export default SummaryFieldNodeAnswers;
