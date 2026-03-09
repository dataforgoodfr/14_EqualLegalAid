import { useState, useEffect } from 'react'
import { AiretableBaseNameEnum,  type FilterInterface } from '@/types/index'
import { useAirtableFilter } from '@/hooks'
import { BasicFilterItem } from '@/components/Filter'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui'

interface AccordionInterface {
    accordionTriggerLabel: string
    airtableBaseName: AiretableBaseNameEnum
    filterType: FilterTypeEnum
    search: {
      enabled: boolean
      placeholder: string
    }
  }
  interface AccordionItemInterface extends AccordionInterface {
    items: any[]
  }

  enum FilterTypeEnum {
    Basic = 'Basic',
    Other = 'Other',
  }

/*
    Comme discuter je pense qu'on pourrait délégué cette partie a une table de config des filtres a afficher dans airtable.
    On pourrait recup directement les infos doit on a besoin en venant fetch cette base de donnée
  */
  const ACCORDION_CONFIG: AccordionInterface[] = [
    {
      accordionTriggerLabel: 'Outcome',
      airtableBaseName: AiretableBaseNameEnum.Outcomes,
      filterType: FilterTypeEnum.Basic,
      search: {
        enabled: false,
        placeholder: 'Search outcome',
      },
    },
    {
      accordionTriggerLabel: 'Country of origin',
      airtableBaseName: AiretableBaseNameEnum.Countries,
      filterType: FilterTypeEnum.Basic,
      search: {
        enabled: true,
        placeholder: 'Search a Country',
      },
    },
    {
      accordionTriggerLabel: 'Competent court',
      airtableBaseName: AiretableBaseNameEnum.LegalProcedureTypes,
      filterType: FilterTypeEnum.Basic,
      search: {
        enabled: false,
        placeholder: 'Search a Competent court',
      },
    },
    {
      accordionTriggerLabel: 'Type of legal procedure',
      airtableBaseName: AiretableBaseNameEnum.LegalProcedureTypes,
      filterType: FilterTypeEnum.Basic,
      search: {
        enabled: false,
        placeholder: 'Search a Type of legal procedure',
      },
    },
  ]

const createAccordionItems = (filterRecords: FilterInterface[]): AccordionItemInterface[] => {
 return ACCORDION_CONFIG.map((accordionConfigItem) => {
    const matchedFilter = filterRecords.find(filter => filter.label === accordionConfigItem.airtableBaseName)

    return {
      ...accordionConfigItem,
      items: matchedFilter?.value ?? [],
      available: matchedFilter?.available ?? false,
    }
  })
}


export const FilterPanel = () => {
  const [caselawId, setCaselawId] = useState<string[]>([])
  const { filterRecords } = useAirtableFilter()
  
  const accordionItems = createAccordionItems(filterRecords)


  // HandleFilterChange :
  /*
    C'est ici que je viens ajouter dans un tableau tous les ids des caselaw qu'ont a besoin de recupéré après que l'utilisateur clique sur des filtres
  */
  const handleFilterChange = (caselawsRelatedToClickedFilter: string[], needToPushValue: boolean) => {

    setCaselawId((previousIds) => {
      if (needToPushValue) {
        const newValues = caselawsRelatedToClickedFilter.filter(value => !previousIds.includes(value))
        return [...previousIds, ...newValues]
      }

      return previousIds.filter(id => !caselawsRelatedToClickedFilter.includes(id))
    })
  }
  useEffect(() => {
    /*
      Au clique sur des filtres on recoit bien tous les id des caselawsdans ce tableau caselawId
      Il faut maintenant a chaque changement faire remonter ce tableau a la racine du projet ou on recupère les recordes pour refaire un fetch des datas
      on peut surement utiliser le refetchCaselawRecords en lui passant le tableau des records qui ont changer pour recup juste ce qu'on veut
      Pour eviter pleins de call on peut surement mettre en place un bouton de validation des filtres pour ne pas lancer des fetch a chaque changement de filtre.
      D'après les maquettes il semblerait que cest se qui est prévu sur mobile du coup peut etre avoir le meme principe sur ordi
      L'utilisateur change les filtres en faisant ca, on met a dispo un bouton filtrer et quand on clique dessus on vient prendre se tableau pour fetch la data ?
    */

    console.log('caselawId:', caselawId)
  }, [caselawId])

  return (
    <Accordion type="multiple">
      {accordionItems.map((accordionItem, accordionItemIndex) => { 
        if (accordionItem.filterType === FilterTypeEnum.Basic) {
        return (
        <AccordionItem value={`item-${accordionItemIndex}`} key={accordionItemIndex}>
          <AccordionTrigger>{ accordionItem.accordionTriggerLabel }</AccordionTrigger>
          <AccordionContent>
            <BasicFilterItem
              enabledSearch={accordionItem.search.enabled}
              searchPlaceholder={accordionItem.search.placeholder}
              items={accordionItem.items}
              onFilterChange={handleFilterChange}
            />
          </AccordionContent>
        </AccordionItem>
        )}
})}
    </Accordion>
  )
}
