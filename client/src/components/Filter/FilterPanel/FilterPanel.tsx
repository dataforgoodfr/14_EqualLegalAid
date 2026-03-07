import { useState, useEffect } from 'react'
import type { AiretableBaseName } from '@/types/index'
import { useAirtableFilter } from '@/hooks'
import { FilterItem } from '@/components/Filter'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui'

export const FilterPanel = () => {
  const [caselawId, setCaselawId] = useState<string[]>([])
  interface AccordionInterface {
    accordionTriggerLabel: string
    airtableBaseName: AiretableBaseName
    search: {
      enabled: boolean
      placeholder: string
    }
  }
  interface AccordionItemInterface extends AccordionInterface {
    items: any[]
  }
  const { filterRecords } = useAirtableFilter()

  /*
    Comme discuter je pense qu'on pourrait délégué cette partie a une table de config des filtres a afficher dans airtable.
    On pourrait recup directement les infos doit on a besoin en venant fetch cette base de donnée
  */
  const ACCORDION_CONFIG: AccordionInterface[] = [
    {
      accordionTriggerLabel: 'Outcome',
      airtableBaseName: 'Outcomes',
      search: {
        enabled: false,
        placeholder: 'Search outcome',
      },
    },
    {
      accordionTriggerLabel: 'Country of origin',
      airtableBaseName: 'Countries',
      search: {
        enabled: true,
        placeholder: 'Search a Country',
      },
    },
    {
      accordionTriggerLabel: 'Competent court',
      airtableBaseName: 'LegalProcedureTypes',
      search: {
        enabled: false,
        placeholder: 'Search a Competent court',
      },
    },
    {
      accordionTriggerLabel: 'Type of legal procedure',
      airtableBaseName: 'LegalProcedureTypes',
      search: {
        enabled: false,
        placeholder: 'Search a Type of legal procedure',
      },
    },
  ]
  const accordionItems: AccordionItemInterface[] = ACCORDION_CONFIG.map((accordionConfigItem) => {
    const matchedFilter = filterRecords.find(filter => filter.label === accordionConfigItem.airtableBaseName)

    return {
      ...accordionConfigItem,
      items: matchedFilter?.value ?? [],
      available: matchedFilter?.available ?? false,
    }
  })

  // HandleFilterChange :
  /*
    C'est ici que je viens ajouter dans un tableau tous les ids des caselaw qu'ont a besoin de recupéré après que l'utilisateur clique sur des filtres
  */
  const handleFilterChange = (values: string[], needToPushValue: boolean) => {
    setCaselawId((previousIds) => {
      if (needToPushValue) {
        const newValues = values.filter(value => !previousIds.includes(value))
        return [...previousIds, ...newValues]
      }

      return previousIds.filter(id => !values.includes(id))
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
    <Accordion type="multiple" collapsible={true}>
      {accordionItems.map((accordionItem, accordionItemIndex) => (
        <AccordionItem value={`item-${accordionItemIndex}`}>
          <AccordionTrigger>{ accordionItem.accordionTriggerLabel }</AccordionTrigger>
          <AccordionContent>
            <FilterItem
              enabledSearch={accordionItem.search.enabled}
              searchPlaceholder={accordionItem.search.placeholder}
              items={accordionItem.items}
              onFilterChange={handleFilterChange}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
