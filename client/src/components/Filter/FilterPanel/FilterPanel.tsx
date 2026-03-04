import { FilterItem } from '../FilterItem/FilterItem'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
export const FilterPanel = () => {
  const AcordionItems = [
    {
      label: 'Ground of persecution'
    },
    {
      label: 'Outcome'
    },
    {
      label: 'Country of origin'
    },
    {
      label: 'Competent court'
    },
    {
      label: 'Type of legal procedure'
    }
  ]
  return (
    <Accordion type="single" collapsible defaultValue="item-0">
      {AcordionItems.map((AcordionItem, AcordionItemIndex) => (
        <AccordionItem value={`item-${AcordionItemIndex}`}>
          <AccordionTrigger>{ AcordionItem.label }</AccordionTrigger>
          <AccordionContent>
            <FilterItem />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
};